import { ModuleOutputDTO, GameServerOutputDTO, RoleOutputDTO, PlayerOutputDTO } from '@takaro/apiclient';
import { integrationConfig, IntegrationTest, EventsAwaiter } from '@takaro/test';
import { GameEvents } from '../dto/index.js';

export interface IDetectedEvent {
  event: GameEvents;
  data: any;
}

export interface IModuleTestsSetupData {
  modules: ModuleOutputDTO[];
  gameserver: GameServerOutputDTO;
  utilsModule: ModuleOutputDTO;
  teleportsModule: ModuleOutputDTO;
  gimmeModule: ModuleOutputDTO;
  onboardingModule: ModuleOutputDTO;
  serverMessagesModule: ModuleOutputDTO;
  role: RoleOutputDTO;
  players: PlayerOutputDTO[];
}

export const sorter = (a: IDetectedEvent, b: IDetectedEvent) => {
  if (a.data.msg < b.data.msg) {
    return -1;
  }
  if (a.data.msg > b.data.msg) {
    return 1;
  }
  return 0;
};

export const modulesTestSetup = async function (
  this: IntegrationTest<IModuleTestsSetupData>
): Promise<IModuleTestsSetupData> {
  const modules = (await this.client.module.moduleControllerSearch()).data.data;

  const gameserver = await this.client.gameserver.gameServerControllerCreate({
    connectionInfo: JSON.stringify({
      host: integrationConfig.get('mockGameserver.host'),
    }),
    type: 'MOCK',
    name: 'Test gameserver',
  });

  const teleportsModule = modules.find((m) => m.name === 'teleports');
  if (!teleportsModule) throw new Error('teleports module not found');

  const gimmeModule = modules.find((m) => m.name === 'gimme');
  if (!gimmeModule) throw new Error('gimme module not found');

  const utilsModule = modules.find((m) => m.name === 'utils');
  if (!utilsModule) throw new Error('utils module not found');

  const serverMessagesModule = modules.find((m) => m.name === 'serverMessages');
  if (!serverMessagesModule) throw new Error('serverMessages module not found');

  const onboardingModule = modules.find((m) => m.name === 'playerOnboarding');
  if (!onboardingModule) throw new Error('playerOnboarding module not found');

  const eventAwaiter = new EventsAwaiter();
  await eventAwaiter.connect(this.client);

  const connectedEvents = eventAwaiter.waitForEvents(GameEvents.PLAYER_CONNECTED, 5);

  await this.client.gameserver.gameServerControllerExecuteCommand(gameserver.data.data.id, {
    command: 'connectAll',
  });
  await connectedEvents;

  const roleRes = await this.client.role.roleControllerCreate({ name: 'test role', permissions: ['ROOT'] });

  const playersRes = await this.client.player.playerControllerSearch();

  await Promise.all(
    playersRes.data.data.map(async (player) => {
      await this.client.player.playerControllerAssignRole(player.id, roleRes.data.data.id);
    })
  );

  return {
    modules: modules,
    utilsModule,
    teleportsModule,
    serverMessagesModule,
    onboardingModule,
    gimmeModule,
    gameserver: gameserver.data.data,
    role: roleRes.data.data,
    players: playersRes.data.data,
  };
};
