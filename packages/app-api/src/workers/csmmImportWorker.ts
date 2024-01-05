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
    await new GameServerCreateDTO().construct({
      name: data.server.name,
      type: GAME_SERVER_TYPE.SEVENDAYSTODIE,
      connectionInfo: JSON.stringify({
        host: `${data.server.ip}:${data.server.webPort}`,
        adminUser: data.server.authName,
        adminToken: data.server.authToken,
        useTls: data.server.webPort === 443,
      }),
    })
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
      await new RoleCreateInputDTO().construct({
        name: role.name,
        permissions: [],
      })
    );
  }

  const roles = await roleService.find({});

  // Sync the players
  for (const player of data.players) {
    if (!player.crossId) {
      log.warn(`Player ${player.name} has no crossId, skipping player resolving`);
      continue;
    }
    const createData = await new IGamePlayer().construct({
      name: player.name,
      gameId: player.crossId.replace('EOS_', ''),
      epicOnlineServicesId: player.crossId.replace('EOS_', ''),
    });

    if (player.steamId.startsWith('XBL_')) {
      createData.xboxLiveId = player.steamId.replace('XBL_', '');
    } else {
      createData.steamId = player.steamId;
    }

    await playerService.sync(await new IGamePlayer().construct(createData), server.id);
  }

  // Sync the player data
  for (const player of data.players) {
    if (!player.crossId) {
      log.warn(`Player ${player.name} has no crossId, skipping role assignment`);
      continue;
    }
    const pog = await pogService.findAssociations(player.crossId.replace('EOS_', ''), server.id);

    if (!pog.length) {
      log.warn(`Player ${player.name} has no player on game server association, skipping role assignment`);
      continue;
    }

    const CSMMRole = data.roles.find((r) => r.id === player.role);
    if (!CSMMRole) {
      log.warn(`Player ${player.name} has no role with id ${player.role}, skipping role assignment`);
      continue;
    }

    const takaroRole = roles.results.find((r) => r.name === CSMMRole.name);

    if (!takaroRole) {
      log.warn(`Player ${player.name} has no role with name ${CSMMRole.name}, skipping role assignment`);
      continue;
    }

    if (!takaroRole.system) {
      log.info(`Assigning role ${takaroRole.name} to player ${player.name}`);
      await playerService.assignRole(takaroRole.id, pog[0].playerId, server.id);
    }

    if (player.currency) {
      await pogService.setCurrency(pog[0].id, Math.floor(player.currency));
    }
  }

  const res = await gameserverService.executeCommand(server.id, 'version');
  if (res.rawResult.includes('1CSMM_Patrons')) {
    await gameserverService.update(
      server.id,
      await new GameServerUpdateDTO().construct({
        connectionInfo: JSON.stringify({
          host: `${data.server.ip}:${data.server.webPort}`,
          adminUser: data.server.authName,
          adminToken: data.server.authToken,
          useTls: data.server.webPort === 443,
          useCPM: true,
        }),
      })
    );
  }

  await job.update({} as ICSMMImportData);
}
