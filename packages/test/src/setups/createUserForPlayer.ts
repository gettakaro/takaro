import { faker } from '@faker-js/faker';
import { GameEvents } from '@takaro/modules';
import { Client, UserOutputDTO } from '@takaro/apiclient';
import { integrationConfig } from '../test/integrationConfig.js';
import { EventsAwaiter } from '../test/waitForEvents.js';
import { expect } from '../test/expect.js';
import { randomUUID } from 'crypto';
import { Redis } from '@takaro/db';

export async function getSecretCodeForPlayer(playerId: string) {
  const redis = await Redis.getClient('playerLink');
  // We store the code in redis with key as the code and the value is the actual secret code
  // secret-code : playerId
  // So we need to reverse it here and do a very inefficient search
  // Unfortunate, but this is test code so not the end of the world
  const allKeys = await redis.keys('*');
  // Filter out the domain keys, we only want keys that store playerIds
  const playerLinkKeys = allKeys.filter((key) => key.startsWith('playerLink') && !key.includes('-domain'));
  // Search through the keys to find the one where the value matches our playerId
  for (const key of playerLinkKeys) {
    const storedPlayerId = await redis.get(key);
    if (storedPlayerId === playerId) {
      return key.split(':')[1];
    }
  }

  throw new Error(`No secret code found for playerId ${playerId}`);
}

/**
 * This function helps in tests where you need to go through the user linking process
 * @param client
 * @param playerId
 * @param gameServerId
 * @param createUser
 * @returns
 */
export async function createUserForPlayer(client: Client, playerId: string, gameServerId: string, createUser = true) {
  const password = randomUUID();

  let user: UserOutputDTO | null = null;

  if (createUser) {
    user = (
      await client.user.userControllerCreate({
        name: 'test',
        email: `test-${faker.internet.email()}`,
        password,
      })
    ).data.data;
  } else {
    const userSearchRes = await client.user.userControllerSearch({ filters: { playerId: [playerId] } });
    if (userSearchRes.data.data.length === 0) {
      throw new Error('No user found for player');
    }
    user = userSearchRes.data.data[0];
  }

  const userClient = new Client({
    auth: { username: user.email, password },
    url: integrationConfig.get('host'),
    log: false,
  });
  await userClient.login();

  const eventsAwaiter = new EventsAwaiter();
  await eventsAwaiter.connect(client);
  const chatEventWaiter = eventsAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);
  await client.command.commandControllerTrigger(gameServerId, {
    msg: '/link',
    playerId,
  });
  const chatEvents = await chatEventWaiter;
  expect(chatEvents).to.have.length(1);
  const code = await getSecretCodeForPlayer(playerId);
  await userClient.user.userControllerLinkPlayerProfile({ email: user.email!, code });

  return {
    user,
    client: userClient,
  };
}
