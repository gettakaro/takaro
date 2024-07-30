import { Job } from 'bullmq';
import { TakaroWorker, ICSMMImportData } from '@takaro/queues';
import { ctx, errors, logger } from '@takaro/util';
import { config } from '../config.js';
import { GameServerCreateDTO, GameServerService, GameServerUpdateDTO } from '../service/GameServerService.js';
import { GAME_SERVER_TYPE } from '@takaro/gameserver';
import { RoleCreateInputDTO, RoleService } from '../service/RoleService.js';
import { PlayerService } from '../service/PlayerService.js';
import { PlayerOnGameServerService } from '../service/PlayerOnGameserverService.js';
import { IGamePlayer } from '@takaro/modules';

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

  // Check if the server already exists
  const existingServer = await gameserverService.find({
    filters: {
      name: [data.server.name],
    },
  });

  if (existingServer.total) {
    throw new errors.BadRequestError(`Server with name ${data.server.name} already exists`);
  }

  const server = await gameserverService.create(
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

  ctx.addData({
    gameServer: server.id,
  });

  // Sync the roles
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

  const roles = await roleService.find({});

  // Sync the players
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

    const CSMMRole = data.roles.find((r) => r.id === csmmPlayer.role);
    if (!CSMMRole) {
      log.warn(`Player ${csmmPlayer.name} has no role with id ${csmmPlayer.role.toString()}, skipping role assignment`);
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

    if (csmmPlayer.currency) {
      await pogService.setCurrency(pog.id, Math.floor(csmmPlayer.currency));
    }
  }

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

  await job.update({} as ICSMMImportData);
}
