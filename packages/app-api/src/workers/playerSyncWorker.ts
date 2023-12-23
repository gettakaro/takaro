import { IGameServerQueueData, TakaroWorker, queueService } from '@takaro/queues';
import { config } from '../config.js';
import { Job } from 'bullmq';
import { logger } from '@takaro/util';
import { DomainService } from '../service/DomainService.js';
import { GameServerService } from '../service/GameServerService.js';
import { ctx } from '@takaro/util';
import { PlayerService } from '../service/PlayerService.js';
import { PlayerOnGameServerService, PlayerOnGameServerUpdateDTO } from '../service/PlayerOnGameserverService.js';

const log = logger('worker:inventory');

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
    log.info('Processing playerSync job for all domains');

    const domainsService = new DomainService();
    const domains = await domainsService.find({});

    for (const domain of domains.results) {
      const promises = [];

      const playerService = new PlayerService(domain.id);
      promises.push(playerService.handleSteamSync());

      const gameserverService = new GameServerService(domain.id);
      const gameServers = await gameserverService.find({});
      promises.push(
        gameServers.results.map(async (gs) => {
          const reachable = await gameserverService.testReachability(gs.id);
          if (reachable.connectable) {
            await queueService.queues.playerSync.queue.add(
              { domainId: domain.id, gameServerId: gs.id },
              { jobId: `playerSync-${domain.id}-${gs.id}-${Date.now()}` }
            );
          }
        })
      );

      await Promise.allSettled(promises);
    }

    return;
  }

  if (job.data.gameServerId) {
    const { domainId, gameServerId } = job.data;
    log.info(`Processing playerSync job for domain: ${domainId} and game server: ${gameServerId}`);
    const gameServerService = new GameServerService(domainId);
    const playerService = new PlayerService(domainId);
    const playerOnGameServerService = new PlayerOnGameServerService(domainId);

    const onlinePlayers = await gameServerService.getPlayers(gameServerId);

    const promises = [];

    promises.push(
      onlinePlayers.map(async (player) => {
        log.debug(`Syncing player ${player.gameId} on game server ${gameServerId}`);
        await playerService.sync(player, gameServerId);
        const resolvedPlayer = await playerService.resolveRef(player, gameServerId);
        await gameServerService.getPlayerLocation(gameServerId, resolvedPlayer.id);

        await playerOnGameServerService.addInfo(
          player,
          gameServerId,
          await new PlayerOnGameServerUpdateDTO().construct({
            ip: player.ip,
            ping: player.ping,
          })
        );
      })
    );

    promises.push(playerOnGameServerService.setOnlinePlayers(gameServerId, onlinePlayers));

    await Promise.all(promises);

    // Processing for a specific game server
    await gameServerService.syncInventories(gameServerId);

    return;
  }

  log.error(`Invalid job data: ${JSON.stringify(job.data)}`);
}
