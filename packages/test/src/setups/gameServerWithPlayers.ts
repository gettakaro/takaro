import { EventsAwaiter } from '../test/waitForEvents.js';
import {
  GameServerOutputDTO,
  ModuleOutputDTO,
  PlayerOnGameserverOutputDTO,
  PlayerOutputDTO,
  Client,
} from '@takaro/apiclient';
import { IntegrationTest } from '../integrationTest.js';
import { randomUUID } from 'crypto';
import { getMockServer } from '@takaro/mock-gameserver';
import { expect } from '../test/expect.js';

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

async function triggerItemSync(client: Client, gameServerId: string) {
  const triggeredJobRes = await client.gameserver.gameServerControllerTriggerJob('syncItems', gameServerId);
  const triggeredJob = triggeredJobRes.data.data;
  if (!triggeredJob || !triggeredJob.id) throw new Error('Triggered job ID not found');

  // Poll the job until it's done
  while (true) {
    const jobToAwait = (await client.gameserver.gameServerControllerGetJob('syncItems', triggeredJob.id)).data.data;
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

async function triggerEntitySync(client: Client, gameServerId: string) {
  const triggeredJobRes = await client.gameserver.gameServerControllerTriggerJob('syncEntities', gameServerId);
  const triggeredJob = triggeredJobRes.data.data;
  if (!triggeredJob || !triggeredJob.id) throw new Error('Triggered job ID not found');

  // Poll the job until it's done
  while (true) {
    const jobToAwait = (await client.gameserver.gameServerControllerGetJob('syncEntities', triggeredJob.id)).data.data;
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

export const setup = async function (this: IntegrationTest<ISetupData>): Promise<ISetupData> {
  const eventsAwaiter = new EventsAwaiter();
  await eventsAwaiter.connect(this.client);
  // 20 players, 20 pogs should be created
  const connectedEvents = eventsAwaiter.waitForEvents('player-created', 40);

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

  // Trigger itemSync and entitySync jobs for both game servers and wait for completion
  await Promise.all([
    triggerItemSync(this.client, gameServer1.id),
    triggerItemSync(this.client, gameServer2.id),
    triggerEntitySync(this.client, gameServer1.id),
    triggerEntitySync(this.client, gameServer2.id),
  ]);
  expect(await connectedEvents).to.have.length(40, 'Setup fail: should have 20 players-created events');

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

  expect(pogs1.length).to.equal(10, 'Setup fail: should have 10 pogs on game server 1');
  expect(pogs2.length).to.equal(10, 'Setup fail: should have 10 pogs on game server 2');
  expect(players.length).to.equal(20, 'Setup fail: should have 20 players total');

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
