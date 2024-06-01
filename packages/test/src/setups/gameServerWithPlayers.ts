import { EventsAwaiter } from '../test/waitForEvents.js';
import { GameServerOutputDTO, ModuleOutputDTO, PlayerOutputDTO } from '@takaro/apiclient';
import { HookEvents } from '@takaro/modules';
import { IntegrationTest } from '../integrationTest.js';
import { integrationConfig } from '../test/integrationConfig.js';

export interface ISetupData {
  gameServer1: GameServerOutputDTO;
  gameServer2: GameServerOutputDTO;
  players: PlayerOutputDTO[];
  mod: ModuleOutputDTO;
}

export const setup = async function (this: IntegrationTest<ISetupData>): Promise<ISetupData> {
  const eventsAwaiter = new EventsAwaiter();
  await eventsAwaiter.connect(this.client);
  // 10 players, 10 pogs should be created
  const connectedEvents = eventsAwaiter.waitForEvents(HookEvents.PLAYER_CREATED, 20);

  const gameServer1 = await this.client.gameserver.gameServerControllerCreate({
    name: 'Gameserver 1',
    type: 'MOCK',
    connectionInfo: JSON.stringify({
      host: integrationConfig.get('mockGameserver.host'),
      name: 'mock1',
    }),
  });

  const gameServer2 = await this.client.gameserver.gameServerControllerCreate({
    name: 'Gameserver 2',
    type: 'MOCK',
    connectionInfo: JSON.stringify({
      host: integrationConfig.get('mockGameserver.host'),
      name: 'mock2',
    }),
  });

  const mod = (
    await this.client.module.moduleControllerCreate({
      name: 'Test module',
    })
  ).data.data;

  await Promise.all([
    this.client.gameserver.gameServerControllerExecuteCommand(gameServer1.data.data.id, { command: 'connectAll' }),
    this.client.gameserver.gameServerControllerExecuteCommand(gameServer2.data.data.id, { command: 'connectAll' }),
  ]);

  await connectedEvents;

  const players = (await this.client.player.playerControllerSearch()).data.data;

  return {
    gameServer1: gameServer1.data.data,
    gameServer2: gameServer2.data.data,
    players,
    mod,
  };
};
