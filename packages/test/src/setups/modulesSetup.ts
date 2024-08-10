import { ModuleOutputDTO, GameServerOutputDTO, RoleOutputDTO, PlayerOutputDTO } from '@takaro/apiclient';
import { EventTypes, HookEvents } from '@takaro/modules';
import { EventsAwaiter, IntegrationTest, integrationConfig } from '../main.js';

export interface IDetectedEvent {
  event: EventTypes;
  data: any;
}

export interface IModuleTestsSetupData {
  modules: ModuleOutputDTO[];
  gameserver: GameServerOutputDTO;
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
  eventAwaiter: EventsAwaiter;
}

export const chatMessageSorter = (a: IDetectedEvent, b: IDetectedEvent) => {
  if (a.data.msg < b.data.msg) {
    return -1;
  }
  if (a.data.msg > b.data.msg) {
    return 1;
  }
  return 0;
};

export const modulesTestSetup = async function (
  this: IntegrationTest<IModuleTestsSetupData>,
): Promise<IModuleTestsSetupData> {
  const modules = (await this.client.module.moduleControllerSearch()).data.data;

  const eventAwaiter = new EventsAwaiter();
  await eventAwaiter.connect(this.client);
  // 10 players, 10 pogs should be created
  const playerCreatedEvents = eventAwaiter.waitForEvents(HookEvents.PLAYER_CREATED, 20);

  const gameServer1 = await this.client.gameserver.gameServerControllerCreate({
    name: 'Gameserver 1',
    type: 'MOCK',
    connectionInfo: JSON.stringify({
      host: integrationConfig.get('mockGameserver.host'),
      name: `test-${this.test.name}-${this.standardDomainId}-1`,
    }),
  });

  const gameServer2 = await this.client.gameserver.gameServerControllerCreate({
    name: 'Gameserver 2',
    type: 'MOCK',
    connectionInfo: JSON.stringify({
      host: integrationConfig.get('mockGameserver.host'),
      name: `test-${this.test.name}-${this.standardDomainId}-2`,
    }),
  });

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
    this.client.gameserver.gameServerControllerExecuteCommand(gameServer1.data.data.id, { command: 'connectAll' }),
    this.client.gameserver.gameServerControllerExecuteCommand(gameServer2.data.data.id, { command: 'connectAll' }),
  ]);

  await playerCreatedEvents;

  const permissions = await this.client.permissionCodesToInputs(['ROOT']);
  const roleRes = await this.client.role.roleControllerCreate({ name: 'test role', permissions });

  const pogsRes = (
    await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
      filters: { gameServerId: [gameServer1.data.data.id] },
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
    gameserver: gameServer1.data.data,
    role: roleRes.data.data,
    players: playersRes.data.data,
    eventAwaiter,
  };
};
