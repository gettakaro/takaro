import { EventsAwaiter } from '../test/waitForEvents.js';
import { GameServerOutputDTO, ModuleOutputDTO, PlayerOutputDTO } from '@takaro/apiclient';
import { EventTypes } from '@takaro/modules';
import { IntegrationTest } from '../integrationTest.js';
import { integrationConfig } from '../test/integrationConfig.js';

export interface ISetupData {
  gameServer1: GameServerOutputDTO;
  gameServer2: GameServerOutputDTO;
  players: PlayerOutputDTO[];
  mod: ModuleOutputDTO;
}

export const setup = async function (this: IntegrationTest<ISetupData>): Promise<ISetupData> {
  const gameServer1 = await this.client.gameserver.gameServerControllerCreate({
    name: 'Gameserver 1',
    type: 'MOCK',
    connectionInfo: JSON.stringify({
      host: integrationConfig.get('mockGameserver.host'),
    }),
  });

  const gameServer2 = await this.client.gameserver.gameServerControllerCreate({
    name: 'Gameserver 2',
    type: 'MOCK',
    connectionInfo: JSON.stringify({
      host: integrationConfig.get('mockGameserver.host'),
    }),
  });

  const mod = (
    await this.client.module.moduleControllerCreate({
      name: 'Test module',
    })
  ).data.data;

  const eventsAwaiter = new EventsAwaiter();
  await eventsAwaiter.connect(this.client);
  const connectedEvents = eventsAwaiter.waitForEvents(EventTypes.PLAYER_CONNECTED, 10);

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
