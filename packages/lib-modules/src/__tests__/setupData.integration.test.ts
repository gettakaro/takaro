import { ModuleOutputDTO, GameServerOutputDTO } from '@takaro/apiclient';
import {
  integrationConfig,
  IntegrationTest,
  EventsAwaiter,
} from '@takaro/test';
import { GameEvents } from '@takaro/gameserver';

export interface IDetectedEvent {
  event: GameEvents;
  data: any;
}

export interface IModuleTestsSetupData {
  modules: ModuleOutputDTO[];
  gameserver: GameServerOutputDTO;
  utilsModule: ModuleOutputDTO;
  teleportsModule: ModuleOutputDTO;
  onboardingModule: ModuleOutputDTO;
  serverMessagesModule: ModuleOutputDTO;
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

  const utilsModule = modules.find((m) => m.name === 'utils');
  if (!utilsModule) throw new Error('utils module not found');

  const serverMessagesModule = modules.find((m) => m.name === 'serverMessages');
  if (!serverMessagesModule) throw new Error('serverMessages module not found');

  const onboardingModule = modules.find((m) => m.name === 'playerOnboarding');
  if (!onboardingModule) throw new Error('playerOnboarding module not found');

  const eventAwaiter = new EventsAwaiter();
  await eventAwaiter.connect(this.client);

  const connectedEvents = eventAwaiter.waitForEvents(
    GameEvents.PLAYER_CONNECTED,
    5
  );

  await this.client.gameserver.gameServerControllerExecuteCommand(
    gameserver.data.data.id,
    {
      command: 'connectAll',
    }
  );

  await connectedEvents;

  return {
    modules: modules,
    utilsModule,
    teleportsModule,
    serverMessagesModule,
    onboardingModule,
    gameserver: gameserver.data.data,
  };
};
