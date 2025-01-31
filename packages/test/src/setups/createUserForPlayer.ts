import { faker } from '@faker-js/faker';
import { GameEvents } from '@takaro/modules';
import { Client, UserOutputDTO } from '@takaro/apiclient';
import { integrationConfig } from '../test/integrationConfig.js';
import { EventsAwaiter } from '../test/waitForEvents.js';
import { expect } from '../test/expect.js';
import { randomUUID } from 'crypto';

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
  const code = chatEvents[0].data.meta.msg.match(/code=(\w+-\w+-\w+)/)[1];
  await userClient.user.userControllerLinkPlayerProfile({ email: user.email, code });

  return {
    user,
    client: userClient,
  };
}
