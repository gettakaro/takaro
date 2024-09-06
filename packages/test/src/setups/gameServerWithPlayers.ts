import { EventsAwaiter } from '../test/waitForEvents.js';
import { GameServerOutputDTO, ModuleOutputDTO, PlayerOnGameserverOutputDTO, PlayerOutputDTO } from '@takaro/apiclient';
import { IntegrationTest } from '../integrationTest.js';
import { integrationConfig } from '../test/integrationConfig.js';

export interface ISetupData {
  gameServer1: GameServerOutputDTO;
  gameServer2: GameServerOutputDTO;
  players: PlayerOutputDTO[];
  pogs1: PlayerOnGameserverOutputDTO[];
  pogs2: PlayerOnGameserverOutputDTO[];
  mod: ModuleOutputDTO;
  eventsAwaiter: EventsAwaiter;
}

export const setup = async function (this: IntegrationTest<ISetupData>): Promise<ISetupData> {
  const eventsAwaiter = new EventsAwaiter();
  await eventsAwaiter.connect(this.client);
  // 10 players, 10 pogs should be created
  const connectedEvents = eventsAwaiter.waitForEvents('player-created', 20);

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
  const pogs1 = (
    await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
      filters: { gameServerId: [gameServer1.data.data.id] },
    })
  ).data.data;
  const pogs2 = (
    await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
      filters: { gameServerId: [gameServer2.data.data.id] },
    })
  ).data.data;

  return {
    gameServer1: gameServer1.data.data,
    gameServer2: gameServer2.data.data,
    players,
    pogs1,
    pogs2,
    mod,
    eventsAwaiter,
  };
};
