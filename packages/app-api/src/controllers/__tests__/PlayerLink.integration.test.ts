import {
  IntegrationTest,
  expect,
  SetupGameServerPlayers,
  MailhogAPI,
  integrationConfig,
  EventsAwaiter,
  getSecretCodeForPlayer,
} from '@takaro/test';
import { GameEvents, HookEvents } from '@takaro/modules';
import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { Client, isAxiosError } from '@takaro/apiclient';
import { describe } from 'node:test';

const group = 'Player-User linking';

async function createUser(client: Client) {
  const randomPassword = randomUUID();
  const user = (
    await client.user.userControllerCreate({
      name: 'test',
      email: `test-${faker.internet.email()}`,
      password: randomPassword,
    })
  ).data.data;

  return {
    user,
    password: randomPassword,
  };
}

async function checkIfInviteLinkReceived(userEmail: string) {
  const mailClient = new MailhogAPI({ baseURL: integrationConfig.get('mailhog.url') });
  const mails = await mailClient.searchMessages({ kind: 'to', query: userEmail });
  const inviteLinkMatch = mails.items[0].Content.Body.match(/href="(.*)"/);
  expect(inviteLinkMatch).to.have.length(2);
}

async function triggerLink(
  client: Client,
  userClient: Client,
  setupData: SetupGameServerPlayers.ISetupData,
  email: string,
) {
  const eventsAwaiter = new EventsAwaiter();
  await eventsAwaiter.connect(client);
  const chatEventWaiter = eventsAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);
  await client.command.commandControllerTrigger(setupData.gameServer1.id, {
    msg: '/link',
    playerId: setupData.pogs1[0].playerId,
  });
  const chatEvents = await chatEventWaiter;
  expect(chatEvents).to.have.length(1);
  const code = await getSecretCodeForPlayer(setupData.pogs1[0].playerId);
  await userClient.user.userControllerLinkPlayerProfile({ email, code });
}

async function getClient(email: string, password: string) {
  const client = new Client({ auth: { username: email, password }, url: integrationConfig.get('host') });
  await client.login();
  return client;
}

async function checkRoleAndPermissions(client: Client, userClient: Client, userId: string) {
  try {
    await userClient.player.playerControllerSearch();
    throw new Error('Should not be able to search for players');
  } catch (error) {
    if (!isAxiosError(error)) throw error;
    if (isAxiosError(error) && !error.response) throw error;
    expect(error.response?.data.meta.error.code).to.be.equal('ForbiddenError');
  }

  const roles = (await client.role.roleControllerSearch()).data.data;
  const adminRole = roles.find((role) => role.name === 'Admin');
  if (!adminRole) throw new Error('Admin role not found');
  await client.user.userControllerAssignRole(userId, adminRole.id);

  try {
    const players = await client.player.playerControllerSearch();
    expect(players.data.data).to.have.length(20);
  } catch (error) {
    if (!isAxiosError(error) || !error.response) throw error;
    expect(error.response?.data.meta.error.code).to.be.equal('ForbiddenError');
  }
}

const tests = [
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'ingame-flow: happy path with no existing identity',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const userEmail = `test_${faker.internet.email()}`;

      const eventsAwaiter = new EventsAwaiter();
      await eventsAwaiter.connect(this.client);
      const chatEventWaiter = eventsAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);
      await this.client.command.commandControllerTrigger(this.setupData.gameServer1.id, {
        msg: '/link',
        playerId: this.setupData.pogs1[0].playerId,
      });

      const chatEvents = await chatEventWaiter;
      expect(chatEvents).to.have.length(1);

      const unAuthedClient = new Client({ url: integrationConfig.get('host'), auth: {} });

      const code = await getSecretCodeForPlayer(this.setupData.pogs1[0].playerId);

      await unAuthedClient.user.userControllerLinkPlayerProfile({
        email: userEmail,
        code,
      });

      await checkIfInviteLinkReceived(userEmail);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'ingame-flow: happy path with existing identity',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const existingUser = await createUser(this.client);
      const userClient = await getClient(existingUser.user.email, existingUser.password);
      await triggerLink(this.client, userClient, this.setupData, existingUser.user.email);
      await checkRoleAndPermissions(this.client, userClient, existingUser.user.id);
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Error path: Link with invalid code',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const userEmail = `test_${faker.internet.email()}`;

      const eventsAwaiter = new EventsAwaiter();
      await eventsAwaiter.connect(this.client);
      const chatEventWaiter = eventsAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);
      await this.client.command.commandControllerTrigger(this.setupData.gameServer1.id, {
        msg: '/link',
        playerId: this.setupData.pogs1[0].playerId,
      });

      const chatEvents = await chatEventWaiter;
      expect(chatEvents).to.have.length(1);

      const invalidCode = '12345-invalid-code';

      try {
        await this.client.user.userControllerLinkPlayerProfile({
          email: userEmail,
          code: invalidCode,
        });
        throw new Error('Should not be able to link with invalid code');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        expect(error.response?.data.meta.error.code).to.be.equal('BadRequestError');
        expect(error.response?.data.meta.error.message).to.be.equal(
          'Invalid player link code. Please verify the code and try again.',
        );
      }
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Error path: fill in the email of userA when logged in as userB',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const userA = await createUser(this.client);
      const userB = await createUser(this.client);
      const userBClient = await getClient(userB.user.email, userB.password);

      const eventsAwaiter = new EventsAwaiter();
      await eventsAwaiter.connect(this.client);
      const chatEventWaiter = eventsAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);
      await this.client.command.commandControllerTrigger(this.setupData.gameServer1.id, {
        msg: '/link',
        playerId: this.setupData.pogs1[0].playerId,
      });

      const chatEvents = await chatEventWaiter;
      expect(chatEvents).to.have.length(1);

      try {
        await userBClient.user.userControllerLinkPlayerProfile({
          email: userA.user.email,
          code: await getSecretCodeForPlayer(this.setupData.pogs1[0].playerId),
        });
        throw new Error('Should not be able to link with existing email');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        expect(error.response?.data.meta.error.code).to.be.equal('BadRequestError');
        expect(error.response?.data.meta.error.message).to.be.equal(
          'Email already in use, please login with the correct user first',
        );
      }
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Error path: fill in email of userA when not logged in',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const userA = await createUser(this.client);

      const eventsAwaiter = new EventsAwaiter();
      await eventsAwaiter.connect(this.client);
      const chatEventWaiter = eventsAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);
      await this.client.command.commandControllerTrigger(this.setupData.gameServer1.id, {
        msg: '/link',
        playerId: this.setupData.pogs1[0].playerId,
      });

      const chatEvents = await chatEventWaiter;
      expect(chatEvents).to.have.length(1);

      const unAuthedClient = new Client({ url: integrationConfig.get('host'), auth: {} });

      try {
        await unAuthedClient.user.userControllerLinkPlayerProfile({
          email: userA.user.email,
          code: await getSecretCodeForPlayer(this.setupData.pogs1[0].playerId),
        });
        throw new Error('Should not be able to link with existing email');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        expect(error.response?.data.meta.error.code).to.be.equal('BadRequestError');
        expect(error.response?.data.meta.error.message).to.be.equal('Email already in use, please login first');
      }
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Linking should not include the secret code in the chat event',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const eventsAwaiter = new EventsAwaiter();
      await eventsAwaiter.connect(this.client);
      const chatEventWaiter = eventsAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);
      await this.client.command.commandControllerTrigger(this.setupData.gameServer1.id, {
        msg: '/link',
        playerId: this.setupData.pogs1[0].playerId,
      });

      const chatEvents = await chatEventWaiter;
      expect(chatEvents).to.have.length(1);

      const code = await getSecretCodeForPlayer(this.setupData.pogs1[0].playerId);
      expect(code).to.be.a.string;

      const eventsRes = await this.client.event.eventControllerSearch({
        filters: {
          eventName: [GameEvents.CHAT_MESSAGE],
        },
      });

      const events = eventsRes.data.data;

      expect(JSON.stringify(events)).to.not.include(code);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Linking should produce a command-executed event',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const eventsAwaiter = new EventsAwaiter();
      await eventsAwaiter.connect(this.client);
      const chatEventWaiter = eventsAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);
      await this.client.command.commandControllerTrigger(this.setupData.gameServer1.id, {
        msg: '/link',
        playerId: this.setupData.pogs1[0].playerId,
      });

      const chatEvents = await chatEventWaiter;
      expect(chatEvents).to.have.length(1);

      const eventsRes = await this.client.event.eventControllerSearch({
        filters: {
          eventName: [HookEvents.COMMAND_EXECUTED],
        },
      });

      const events = eventsRes.data.data;

      expect(events).to.have.length(1);
      expect(events[0].meta).to.have.property('command');
    },
  }),

  // TODO: Link 2 players to 2 different domains
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
