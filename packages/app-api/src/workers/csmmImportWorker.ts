import { Job } from 'bullmq';
import { TakaroWorker, ICSMMImportData, queueService } from '@takaro/queues';
import { ctx, logger } from '@takaro/util';
import { config } from '../config.js';
import {
  GameServerCreateDTO,
  GameServerOutputDTO,
  GameServerService,
  GameServerUpdateDTO,
} from '../service/GameServerService.js';
import { GAME_SERVER_TYPE } from '@takaro/gameserver';
import { RoleCreateInputDTO, RoleService } from '../service/RoleService.js';
import { PlayerService } from '../service/PlayerService.js';
import { PlayerOnGameServerService } from '../service/PlayerOnGameserverService.js';
import { IGamePlayer } from '@takaro/modules';
import { ShopListingService } from '../service/Shop/index.js';
import { ShopListingCreateDTO, ShopListingItemMetaInputDTO } from '../service/Shop/dto.js';

const log = logger('worker:csmmImport');

interface ICSMMPlayer {
  // Can be xbl ID too...
  // XBL_xxx
  steamId: string;
  name: string;
  ip: string;
  crossId: string;
  role: number;
  currency: number;
}

interface ICSMMRole {
  id: number;
  name: string;
}

interface ICSMMShopListing {
  name: string;
  friendlyName: string;
  price: number;
  amount: number;
  quality: string;
}

interface ICSMMData {
  server: {
    name: string;
    ip: string;
    webPort: number;
    authName: string;
    authToken: string;
  };
  players: ICSMMPlayer[];
  roles: ICSMMRole[];
  shopListings: ICSMMShopListing[];
}

export class CSMMImportWorker extends TakaroWorker<ICSMMImportData> {
  constructor() {
    super(config.get('queues.csmmImport.name'), 1, process);
  }
}

async function process(job: Job<ICSMMImportData>) {
  ctx.addData({
    domain: job.data.domainId,
    jobId: job.id,
  });

  const data = job.data.csmmExport as unknown as ICSMMData;

  if (!data) {
    log.warn('No data found in job, skipping');
    return;
  }

  const gameserverService = new GameServerService(job.data.domainId);
  const roleService = new RoleService(job.data.domainId);
  const playerService = new PlayerService(job.data.domainId);
  const pogService = new PlayerOnGameServerService(job.data.domainId);
  const shopListingService = new ShopListingService(job.data.domainId);

  let server: GameServerOutputDTO | null;

  // Check if the server already exists
  const existingServer = await gameserverService.find({
    filters: {
      name: [data.server.name],
    },
  });

  if (existingServer.total) {
    server = existingServer.results[0];
  } else {
    server = await gameserverService.create(
      new GameServerCreateDTO({
        name: data.server.name,
        type: GAME_SERVER_TYPE.SEVENDAYSTODIE,
        connectionInfo: JSON.stringify({
          host: `${data.server.ip}:${data.server.webPort.toString()}`,
          adminUser: data.server.authName,
          adminToken: data.server.authToken,
          useTls: data.server.webPort === 443,
        }),
      }),
    );
  }

  ctx.addData({
    gameServer: server.id,
  });

  // Sync the roles
  if (job.data.options.roles) {
    for (const role of data.roles) {
      const existing = await roleService.find({
        filters: {
          name: [role.name],
        },
      });

      if (existing.total) {
        continue;
      }

      await roleService.create(
        new RoleCreateInputDTO({
          name: role.name,
          permissions: [],
        }),
      );
    }
  }

  const roles = await roleService.find({});

  // Sync the players
  if (job.data.options.players) {
    for (const csmmPlayer of data.players) {
      if (!csmmPlayer.crossId) {
        log.warn(`Player ${csmmPlayer.name} has no crossId, skipping player resolving`);
        continue;
      }
      const createData = new IGamePlayer({
        name: csmmPlayer.name,
        gameId: csmmPlayer.crossId.replace('EOS_', ''),
        epicOnlineServicesId: csmmPlayer.crossId.replace('EOS_', ''),
      });

      if (csmmPlayer.steamId.startsWith('XBL_')) {
        createData.xboxLiveId = csmmPlayer.steamId.replace('XBL_', '');
      } else {
        createData.steamId = csmmPlayer.steamId;
      }

      const { player, pog } = await playerService.resolveRef(new IGamePlayer(createData), server.id);

      if (!csmmPlayer.crossId) {
        log.warn(`Player ${csmmPlayer.name} has no crossId, skipping role assignment`);
        continue;
      }

      if (job.data.options.roles) {
        const CSMMRole = data.roles.find((r) => r.id === csmmPlayer.role);
        if (!CSMMRole) {
          log.warn(
            `Player ${csmmPlayer.name} has no role with id ${csmmPlayer.role.toString()}, skipping role assignment`,
          );
          continue;
        }

        const takaroRole = roles.results.find((r) => r.name === CSMMRole.name);

        if (!takaroRole) {
          log.warn(`Player ${csmmPlayer.name} has no role with name ${CSMMRole.name}, skipping role assignment`);
          continue;
        }

        if (!takaroRole.system) {
          log.info(`Assigning role ${takaroRole.name} to player ${csmmPlayer.name}`);
          await playerService.assignRole(takaroRole.id, player.id, server.id);
        }
      }

      if (job.data.options.currency) {
        if (csmmPlayer.currency) {
          await pogService.setCurrency(pog.id, Math.floor(csmmPlayer.currency));
        }
      }
    }
  }

  try {
    const isReachable = await gameserverService.testReachability(server.id);
    if (isReachable) {
      const res = await gameserverService.executeCommand(server.id, 'version');
      if (res.rawResult.includes('1CSMM_Patrons')) {
        await gameserverService.update(
          server.id,
          new GameServerUpdateDTO({
            connectionInfo: JSON.stringify({
              host: `${data.server.ip}:${data.server.webPort.toString()}`,
              adminUser: data.server.authName,
              adminToken: data.server.authToken,
              useTls: data.server.webPort === 443,
              useCPM: true,
            }),
          }),
        );
      }
    }
  } catch (error) {
    log.warn('Error while determining CPM compatiblity', error);
  }

  // Poll the item sync job until it's done
  let isFinished = false;
  while (!isFinished) {
    const itemSyncJob = await queueService.queues.itemsSync.queue.bullQueue.getJob(
      `itemsSync-${job.data.domainId}-${server.id}-init`,
    );
    if (!itemSyncJob) {
      log.warn('Item sync job not found, skipping');
      break;
    }
    if ((await itemSyncJob.isFailed()) || (await itemSyncJob.isCompleted())) {
      isFinished = true;
    }
  }

  // Import shop listings
  if (job.data.options.shop) {
    for (const listing of data.shopListings) {
      // CSMM stores quality null as 0...
      const quality = listing.quality.toString() === '0' ? null : listing.quality;

      await shopListingService.create(
        new ShopListingCreateDTO({
          gameServerId: server.id,
          name: listing.friendlyName || listing.name,
          price: listing.price,
          items: [
            new ShopListingItemMetaInputDTO({
              amount: listing.amount,
              code: listing.name,
              quality: quality,
            }),
          ],
        }),
      );
    }
  }

  await job.updateData({} as ICSMMImportData);
}
