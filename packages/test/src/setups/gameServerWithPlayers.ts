import { EventsAwaiter } from '../test/waitForEvents.js';
import { GameServerOutputDTO, ModuleOutputDTO, PlayerOnGameserverOutputDTO, PlayerOutputDTO } from '@takaro/apiclient';
import { IntegrationTest } from '../integrationTest.js';
import { randomUUID } from 'crypto';
import { getMockServer } from '@takaro/mock-gameserver';

export interface ISetupData {
  gameServer1: GameServerOutputDTO;
  gameServer2: GameServerOutputDTO;
  players: PlayerOutputDTO[];
  pogs1: PlayerOnGameserverOutputDTO[];
  pogs2: PlayerOnGameserverOutputDTO[];
  mod: ModuleOutputDTO;
  eventsAwaiter: EventsAwaiter;
  mockservers: Awaited<ReturnType<typeof getMockServer>>[];
}

export const setup = async function (this: IntegrationTest<ISetupData>): Promise<ISetupData> {
  const eventsAwaiter = new EventsAwaiter();
  await eventsAwaiter.connect(this.client);
  // 10 players, 10 pogs should be created
  const connectedEvents = eventsAwaiter.waitForEvents('player-created', 20);

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

  const mod = (
    await this.client.module.moduleControllerCreate({
      name: 'Test module',
    })
  ).data.data;

  await Promise.all([
    this.client.gameserver.gameServerControllerExecuteCommand(gameServer1.id, { command: 'connectAll' }),
    this.client.gameserver.gameServerControllerExecuteCommand(gameServer2.id, { command: 'connectAll' }),
  ]);

  await connectedEvents;

  const players = (await this.client.player.playerControllerSearch()).data.data;
  const pogs1 = (
    await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
      filters: { gameServerId: [gameServer1.id] },
    })
  ).data.data;
  const pogs2 = (
    await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
      filters: { gameServerId: [gameServer2.id] },
    })
  ).data.data;

  return {
    gameServer1: gameServer1,
    gameServer2: gameServer2,
    players,
    pogs1,
    pogs2,
    mod,
    eventsAwaiter,
    mockservers: [mockserver1, mockserver2],
  };
};
