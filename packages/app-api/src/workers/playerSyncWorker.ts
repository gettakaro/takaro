import { IGameServerQueueData, TakaroWorker, queueService } from '@takaro/queues';
import { config } from '../config.js';
import { Job } from 'bullmq';
import { logger, ctx } from '@takaro/util';
import { DomainService } from '../service/DomainService.js';
import { GameServerService } from '../service/GameServerService.js';
import { PlayerService } from '../service/Player/index.js';
import { PlayerOnGameServerService, PlayerOnGameServerUpdateDTO } from '../service/PlayerOnGameserverService.js';
import { getWorkerMetrics } from '../lib/metrics.js';
import { TrackingService } from '../service/Tracking/index.js';

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
      },
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

        const trackingService = new TrackingService(domain.id);
        await trackingService.repo.ensureLocationPartition();

        const gameserverService = new GameServerService(domain.id);
        const gameServers = await gameserverService.find({ filters: { enabled: [true] } });
        promises.push(
          ...gameServers.results.map(async (gs) => {
            const reachable = await gameserverService.testReachability(gs.id);
            if (reachable.connectable) {
              await queueService.queues.playerSync.queue.add(
                { domainId: domain.id, gameServerId: gs.id },
                { jobId: `playerSync-${domain.id}-${gs.id}-${Date.now()}` },
              );
              log.debug(`Added playerSync job for domain: ${domain.id} and game server: ${gs.id}`);
            } else {
              log.debug(`Game server ${gs.id} from domain ${domain.id} is not reachable, skipping...`);
            }

            // If the server is unreachable and it was reachable before, set all players offline
            if (!reachable.connectable && reachable.connectable !== gs.reachable) {
              const playerOnGameServerService = new PlayerOnGameServerService(domain.id);
              await playerOnGameServerService.setOnlinePlayers(gs.id, []);
            }
          }),
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
      }),
    );

    const domainRes = await Promise.allSettled(domainPromises);

    for (const r of domainRes) {
      if (r.status === 'rejected') {
        log.error(r.reason);
        await job.log(r.reason);
      }
    }
    if (domainRes.some((r) => r.status === 'rejected')) {
      throw new Error('Some domain promises failed');
    }

    return;
  }

  if (job.data.gameServerId) {
    await handlePlayerSync(job.data.gameServerId, job.data.domainId);
    return;
  }

  log.error(`Invalid job data: ${JSON.stringify(job.data)}`);
}

export async function handlePlayerSync(gameServerId: string, domainId: string) {
  const workerMetrics = getWorkerMetrics(gameServerId);

  log.debug(`Processing playerSync job for domain: ${domainId} and game server: ${gameServerId}`);
  const gameServerService = new GameServerService(domainId);
  const playerService = new PlayerService(domainId);
  const playerOnGameServerService = new PlayerOnGameServerService(domainId);

  const onlinePlayers = await gameServerService.getPlayers(gameServerId);

  const promises = [];

  workerMetrics.metrics.players_online.set({ gameserver: gameServerId, domain: domainId }, onlinePlayers.length);

  promises.push(
    playerOnGameServerService
      .setOnlinePlayers(gameServerId, onlinePlayers)
      .then(() => log.debug(`Set online players (${onlinePlayers.length}) for game server: ${gameServerId}`)),
  );
  promises.push(
    gameServerService
      .syncInventories(gameServerId)
      .then(() => log.debug(`Synced inventories for game server: ${gameServerId}`)),
  );

  promises.push(
    ...onlinePlayers.map(async (gamePlayer) => {
      log.debug(`Syncing player ${gamePlayer.gameId} on game server ${gameServerId}`);
      const { player, pog } = await playerService.resolveRef(gamePlayer, gameServerId);
      await gameServerService.getPlayerLocation(gameServerId, player.id);

      if (gamePlayer.ip) {
        await playerService.observeIp(player.id, gameServerId, gamePlayer.ip);
      }

      workerMetrics.metrics.player_ping.set(
        { player: player.id, gameserver: gameServerId, domain: domainId },
        gamePlayer.ping ?? 0,
      );

      workerMetrics.metrics.player_currency.set(
        { player: player.id, gameserver: gameServerId, domain: domainId },
        pog.currency,
      );

      await playerOnGameServerService.update(
        pog.id,
        new PlayerOnGameServerUpdateDTO({
          ping: gamePlayer.ping,
          ip: gamePlayer.ip,
        }),
      );
      log.debug(`Synced player ${gamePlayer.gameId} on game server ${gameServerId}`);
    }),
  );

  const res = await Promise.allSettled(promises);
  await workerMetrics.finalize();

  for (const r of res) {
    if (r.status === 'rejected') {
      log.warn(r.reason);
    }
  }

  return;
}
