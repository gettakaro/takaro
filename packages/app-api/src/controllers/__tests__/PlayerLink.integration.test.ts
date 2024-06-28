import { IntegrationTest, expect, SetupGameServerPlayers, MailhogAPI, integrationConfig } from '@takaro/test';
import { GameEvents } from '@takaro/modules';
import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { Client, isAxiosError } from '@takaro/apiclient';

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

async function triggerLinkAndCheck(
  client: Client,
  userClient: Client,
  setupData: SetupGameServerPlayers.ISetupData,
  email: string
) {
  const chatEventWaiter = setupData.eventsAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);
  await client.command.commandControllerTrigger(setupData.gameServer1.id, {
    msg: '/link',
    playerId: setupData.pogs1[0].playerId,
  });
  const chatEvents = await chatEventWaiter;
  expect(chatEvents).to.have.length(1);
  const code = chatEvents[0].data.msg.match(/code=(\w+-\w+-\w+)/)[1];
  await userClient.user.userControllerLinkPlayerProfile({ email, code });
  await checkIfInviteLinkReceived(email);
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
    expect(players.data.data).to.have.length(10);
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
      await triggerLinkAndCheck(this.client, this.client, this.setupData, userEmail);
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
      await triggerLinkAndCheck(this.client, userClient, this.setupData, existingUser.user.email);
      await checkRoleAndPermissions(this.client, userClient, existingUser.user.id);
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Link with invalid code',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const userEmail = `test_${faker.internet.email()}`;

      const chatEventWaiter = this.setupData.eventsAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);
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
        expect(error.response?.data.meta.error.code).to.be.equal('ForbiddenError');
      }
    },
  }),

  // TODO: Link 2 players to 2 different domains
  // TODO: attack vector: fill in somebody elses existing email
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
