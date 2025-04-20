import { ModuleOutputDTO, GameServerOutputDTO, RoleOutputDTO, PlayerOutputDTO, Client } from '@takaro/apiclient';
import type { EventTypes } from '@takaro/modules';
import { EventsAwaiter, IntegrationTest } from '../main.js';
import { randomUUID } from 'crypto';
import { getMockServer } from '@takaro/mock-gameserver';

export interface IDetectedEvent {
  event: EventTypes;
  data: any;
}

export interface IModuleTestsSetupData {
  modules: ModuleOutputDTO[];
  gameserver: GameServerOutputDTO;
  gameserver2: GameServerOutputDTO;
  utilsModule: ModuleOutputDTO;
  teleportsModule: ModuleOutputDTO;
  gimmeModule: ModuleOutputDTO;
  onboardingModule: ModuleOutputDTO;
  economyUtilsModule: ModuleOutputDTO;
  serverMessagesModule: ModuleOutputDTO;
  lotteryModule: ModuleOutputDTO;
  geoBlockModule: ModuleOutputDTO;
  role: RoleOutputDTO;
  players: PlayerOutputDTO[];
  players2: PlayerOutputDTO[];
  mockservers: Awaited<ReturnType<typeof getMockServer>>[];
}

export const chatMessageSorter = (a: IDetectedEvent, b: IDetectedEvent) => {
  if (a.data.meta.msg < b.data.meta.msg) {
    return -1;
  }
  if (a.data.meta.msg > b.data.meta.msg) {
    return 1;
  }
  return 0;
};

async function triggerItemSync(client: Client, gameServerId: string) {
  const triggeredJobRes = await client.gameserver.gameServerControllerTriggerJob('syncItems', gameServerId);
  const triggeredJob = triggeredJobRes.data.data;
  if (!triggeredJob || !triggeredJob.id) throw new Error('Triggered job ID not found');

  // Poll the job until it's done
  while (true) {
    const jobToAwait = await (
      await client.gameserver.gameServerControllerGetJob('syncItems', triggeredJob.id)
    ).data.data;
    if (!jobToAwait) throw new Error('Job not found');
    if (jobToAwait.status === 'completed') {
      break;
    }
    if (jobToAwait.status === 'failed') {
      throw new Error(`Job failed: ${jobToAwait.failedReason}.`);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

export const modulesTestSetup = async function (
  this: IntegrationTest<IModuleTestsSetupData>,
): Promise<IModuleTestsSetupData> {
  const modules = (await this.client.module.moduleControllerSearch()).data.data;

  const eventAwaiter = new EventsAwaiter();
  await eventAwaiter.connect(this.client);
  // 10 players, 10 pogs should be created
  const playerCreatedEvents = eventAwaiter.waitForEvents('player-created', 20);

  if (!this.domainRegistrationToken) throw new Error('Domain registration token is not set. Invalid setup?');
  const gameServer1IdentityToken = randomUUID();
  const gameServer2IdentityToken = randomUUID();
  const mockserver1 = await getMockServer({
    mockserver: { registrationToken: this.domainRegistrationToken, identityToken: gameServer1IdentityToken },
  });
  const mockserver2 = await getMockServer({
    mockserver: { registrationToken: this.domainRegistrationToken, identityToken: gameServer2IdentityToken },
  });

  const gameServers = (
    await this.client.gameserver.gameServerControllerSearch({
      filters: { identityToken: [gameServer1IdentityToken, gameServer2IdentityToken] },
    })
  ).data.data;

  const gameServer1 = gameServers.find((gs) => gs.identityToken === gameServer1IdentityToken);
  const gameServer2 = gameServers.find((gs) => gs.identityToken === gameServer2IdentityToken);

  if (!gameServer1 || !gameServer2) {
    throw new Error('Game servers not found. Did something fail when registering?');
  }

  const teleportsModule = modules.find((m) => m.name === 'teleports');
  if (!teleportsModule) throw new Error('teleports module not found');

  const economyUtilsModule = modules.find((m) => m.name === 'economyUtils');
  if (!economyUtilsModule) throw new Error('economyUtils module not found');

  const gimmeModule = modules.find((m) => m.name === 'gimme');
  if (!gimmeModule) throw new Error('gimme module not found');

  const utilsModule = modules.find((m) => m.name === 'utils');
  if (!utilsModule) throw new Error('utils module not found');

  const serverMessagesModule = modules.find((m) => m.name === 'serverMessages');
  if (!serverMessagesModule) throw new Error('serverMessages module not found');

  const onboardingModule = modules.find((m) => m.name === 'playerOnboarding');
  if (!onboardingModule) throw new Error('playerOnboarding module not found');

  const lotteryModule = modules.find((m) => m.name === 'lottery');
  if (!lotteryModule) throw new Error('lottery module not found');

  const geoBlockModule = modules.find((m) => m.name === 'geoBlock');
  if (!geoBlockModule) throw new Error('geoBlock module not found');

  await Promise.all([
    this.client.gameserver.gameServerControllerExecuteCommand(gameServer1.id, { command: 'connectAll' }),
    this.client.gameserver.gameServerControllerExecuteCommand(gameServer2.id, { command: 'connectAll' }),
  ]);

  await triggerItemSync(this.client, gameServer1.id);
  await triggerItemSync(this.client, gameServer2.id);

  await playerCreatedEvents;

  const permissions = await this.client.permissionCodesToInputs(['ROOT']);
  const roleRes = await this.client.role.roleControllerCreate({ name: 'test role', permissions });

  const pogsRes = (
    await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
      filters: { gameServerId: [gameServer1.id] },
    })
  ).data.data;
  const playersRes = await this.client.player.playerControllerSearch({
    filters: { id: pogsRes.map((p) => p.playerId) },
    extend: ['playerOnGameServers'],
  });

  await Promise.all(
    playersRes.data.data.map(async (player) => {
      await this.client.player.playerControllerAssignRole(player.id, roleRes.data.data.id);
    }),
  );

  const pogsRes2 = (
    await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
      filters: { gameServerId: [gameServer2.id] },
    })
  ).data.data;

  const playersRes2 = await this.client.player.playerControllerSearch({
    filters: { id: pogsRes2.map((p) => p.playerId) },
    extend: ['playerOnGameServers'],
  });

  await Promise.all(
    playersRes2.data.data.map(async (player) => {
      await this.client.player.playerControllerAssignRole(player.id, roleRes.data.data.id);
    }),
  );

  return {
    modules: modules,
    utilsModule,
    teleportsModule,
    serverMessagesModule,
    onboardingModule,
    gimmeModule,
    economyUtilsModule,
    lotteryModule,
    geoBlockModule,
    gameserver: gameServer1,
    gameserver2: gameServer2,
    role: roleRes.data.data,
    players: playersRes.data.data,
    players2: playersRes2.data.data,
    mockservers: [mockserver1, mockserver2],
  };
};
