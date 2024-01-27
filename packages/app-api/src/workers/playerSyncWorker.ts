import { IGameServerQueueData, TakaroWorker, queueService } from '@takaro/queues';
import { config } from '../config.js';
import { Job } from 'bullmq';
import { logger } from '@takaro/util';
import { DomainService } from '../service/DomainService.js';
import { GameServerService } from '../service/GameServerService.js';
import { ctx } from '@takaro/util';
import { PlayerService } from '../service/PlayerService.js';
import { PlayerOnGameServerService, PlayerOnGameServerUpdateDTO } from '../service/PlayerOnGameserverService.js';
import { PlayerLocationStat, PlayerPingStat } from '../lib/stat.js';

const log = logger('worker:playerSync');

export class PlayerSyncWorker extends TakaroWorker<IGameServerQueueData> {
  constructor() {
    super(config.get('queues.playerSync.name'), config.get('queues.playerSync.concurrency'), processJob);
    queueService.queues.playerSync.queue.add(
      { domainId: 'all' },
      {
        jobId: 'playerSync',
        repeat: {
          jobId: 'playerSync',
          every: config.get('queues.playerSync.interval'),
        },
      }
    );
  }
}

export async function processJob(job: Job<IGameServerQueueData>) {
  ctx.addData({
    domain: job.data.domainId,
    gameServer: job.data.gameServerId,
    jobId: job.id,
  });

  if (job.data.domainId === 'all') {
    log.debug('Processing playerSync job for all domains');

    const domainsService = new DomainService();
    const domains = await domainsService.find({});

    const domainPromises = [];

    domainPromises.push(
      ...domains.results.map(async (domain) => {
        const promises = [];

        const gameserverService = new GameServerService(domain.id);
        const gameServers = await gameserverService.find({});
        promises.push(
          ...gameServers.results.map(async (gs) => {
            const reachable = await gameserverService.testReachability(gs.id);
            if (reachable.connectable) {
              await queueService.queues.playerSync.queue.add(
                { domainId: domain.id, gameServerId: gs.id },
                { jobId: `playerSync-${domain.id}-${gs.id}-${Date.now()}` }
              );
              log.debug(`Added playerSync job for domain: ${domain.id} and game server: ${gs.id}`);
            } else {
              log.debug(`Game server ${gs.id} from domain ${domain.id} is not reachable, skipping...`);
            }
          })
        );

        const res = await Promise.allSettled(promises);

        for (const r of res) {
          if (r.status === 'rejected') {
            log.error(r.reason);
            await job.log(r.reason);
          }
        }

        if (res.some((r) => r.status === 'rejected')) {
          throw new Error('Some promises failed');
        }
      })
    );

    await Promise.allSettled(domainPromises);

    return;
  }

  if (job.data.gameServerId) {
    const { domainId, gameServerId } = job.data;
    log.debug(`Processing playerSync job for domain: ${domainId} and game server: ${gameServerId}`);
    const gameServerService = new GameServerService(domainId);
    const playerService = new PlayerService(domainId);
    const playerOnGameServerService = new PlayerOnGameServerService(domainId);
    const playerPingStat = new PlayerPingStat(domainId);

    const onlinePlayers = await gameServerService.getPlayers(gameServerId);

    const promises = [];

    promises.push(
      playerOnGameServerService
        .setOnlinePlayers(gameServerId, onlinePlayers)
        .then(() => log.debug(`Set online players (${onlinePlayers.length}) for game server: ${gameServerId}`))
    );

    promises.push(
      gameServerService
        .syncInventories(gameServerId)
        .then(() => log.debug(`Synced inventories for game server: ${gameServerId}`))
    );

    promises.push(
      ...onlinePlayers.map(async (player) => {
        log.debug(`Syncing player ${player.gameId} on game server ${gameServerId}`);
        await playerService.sync(player, gameServerId);
        const resolvedPlayer = await playerService.resolveRef(player, gameServerId);

        const location = await gameServerService.getPlayerLocation(gameServerId, resolvedPlayer.id);
        const playerLocationStat = new PlayerLocationStat(domainId);

        if (location) {
          playerLocationStat.write({ playerId: resolvedPlayer.id, gameServerId, location });
        }
        if (player.ip) {
          await playerService.observeIp(resolvedPlayer.id, gameServerId, player.ip);
        }
        if (player.ping) {
          playerPingStat.write({
            playerId: resolvedPlayer.id,
            gameServerId,
            ping: player.ping,
          });
        }

        await playerOnGameServerService.addInfo(
          player,
          gameServerId,
          await new PlayerOnGameServerUpdateDTO().construct({
            ping: player.ping,
          })
        );


        await job.log(`Synced player ${player.gameId} on game server ${gameServerId}`);

        await log.debug(`Synced player ${player.gameId} on game server ${gameServerId}`);

      })
    );

    const res = await Promise.allSettled(promises);

    for (const r of res) {
      if (r.status === 'rejected') {
        log.error(r.reason);
        await job.log(r.reason);
      }
    }

    if (res.some((r) => r.status === 'rejected')) {
      throw new Error('Some promises failed');
    }

    return;
  }

  log.error(`Invalid job data: ${JSON.stringify(job.data)}`);
}
