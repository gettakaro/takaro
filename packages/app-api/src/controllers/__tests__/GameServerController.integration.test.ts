import { IntegrationTest, expect, SetupGameServerPlayers, integrationConfig } from '@takaro/test';
import {
  EventChatMessage,
  GameServerCreateDTOTypeEnum,
  GameServerOutputDTO,
  isAxiosError,
  SettingsOutputDTOKeyEnum,
} from '@takaro/apiclient';
import { describe } from 'node:test';
import { HookEvents } from '@takaro/modules';
import { randomUUID } from 'crypto';
import { getMockServer } from '@takaro/mock-gameserver';

const group = 'GameServerController';

const mockGameServer = {
  name: 'Test gameserver',
  connectionInfo: JSON.stringify({
    host: integrationConfig.get('mockGameserver.host'),
  }),
  type: GameServerCreateDTOTypeEnum.Generic,
  identityToken: randomUUID(),
};

const tests = [
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Get by ID',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      return this.client.gameserver.gameServerControllerGetOne(this.setupData.gameServer1.id);
    },
    filteredFields: ['connectionInfo', 'identityToken', 'name'],
  }),
  // Commented out because only generic gameserver types are supported which don't need to be registered by a user
  // This flow is already tested in the mock server tests
  // new IntegrationTest<GameServerOutputDTO>({
  //   group,
  //   snapshot: true,
  //   name: 'Create',
  //   test: async function () {
  //     return this.client.gameserver.gameServerControllerCreate(mockGameServer);
  //   },
  //   filteredFields: ['connectionInfo', 'identityToken'],
  // }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Update',
    filteredFields: ['identityToken'],
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      return this.client.gameserver.gameServerControllerUpdate(this.setupData.gameServer1.id, {
        name: 'Test gameserver 2',
        connectionInfo: JSON.stringify({}),
        type: GameServerCreateDTOTypeEnum.Generic,
      });
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Delete',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      return this.client.gameserver.gameServerControllerRemove(this.setupData.gameServer1.id);
    },
  }),
  new IntegrationTest<GameServerOutputDTO>({
    group,
    snapshot: true,
    name: 'Can get list of gameserver types',
    test: async function () {
      return this.client.gameserver.gameServerControllerGetTypes();
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Cannot create more gameservers than allowed',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('No standard domain id');
      await this.adminClient.domain.domainControllerUpdate(this.standardDomainId, {
        maxGameservers: 1,
      });

      try {
        await this.client.gameserver.gameServerControllerCreate(mockGameServer);
        throw new Error('Should have thrown');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        expect(error.response?.status).to.equal(400);
        expect(error.response?.data.meta.error.message).to.equal('Max game servers reached');
      }

      await this.adminClient.domain.domainControllerUpdate(this.standardDomainId, {
        maxGameservers: 3,
      });

      await this.client.gameserver.gameServerControllerCreate(mockGameServer);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'When sending a message, the created event has the right channel set',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      await this.client.gameserver.gameServerControllerSendMessage(this.setupData.gameServer1.id, {
        message: 'hello1',
      });

      await this.client.gameserver.gameServerControllerSendMessage(this.setupData.gameServer1.id, {
        message: 'hello2',
        opts: {
          recipient: {
            gameId: this.setupData.pogs1[0].gameId,
          },
        },
      });

      const events = (
        await this.client.event.eventControllerSearch({
          filters: {
            eventName: [HookEvents.CHAT_MESSAGE],
          },
          sortBy: 'createdAt',
          sortDirection: 'asc',
        })
      ).data.data;

      expect(events.length).to.equal(2);

      const meta1 = events[0].meta as EventChatMessage;
      const meta2 = events[1].meta as EventChatMessage;
      expect(meta1.channel).to.equal('global');
      expect(meta2.channel).to.equal('whisper');
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'When regenerating the registration token, old connections are invalidated',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const meRes = await this.client.user.userControllerMe();
      const oldRegistrationToken = meRes.data.data.domains[0].serverRegistrationToken;

      // Verify that server connection works initially
      const serverRes = await this.client.gameserver.gameServerControllerTestReachabilityForId(
        this.setupData.gameServer1.id,
      );
      expect(serverRes.data.data.connectable).to.equal(true);

      // Regenerate the token
      await this.client.gameserver.gameServerControllerRegenerateRegistrationToken();

      const newMeRes = await this.client.user.userControllerMe();
      const newRegistrationToken = newMeRes.data.data.domains[0].serverRegistrationToken;
      expect(newRegistrationToken).to.not.equal(oldRegistrationToken);

      // Verify that server connection fails with the old token
      const res = await this.client.gameserver.gameServerControllerTestReachabilityForId(this.setupData.gameServer1.id);
      expect(res.data.data.connectable).to.equal(false);
      expect(res.data.data.reason).to.equal('Game server is not connected');
    },
  }),
  new IntegrationTest({
    group,
    snapshot: false,
    name: 'Automatic sync jobs are triggered when server registers',
    test: async function () {
      if (!this.domainRegistrationToken) throw new Error('Domain registration token is not set. Invalid setup?');
      const gameServerIdentityToken = randomUUID();

      // Create a new mock server that will register automatically
      const mockServer = await getMockServer({
        mockserver: { registrationToken: this.domainRegistrationToken, identityToken: gameServerIdentityToken },
      });

      // Wait for the server to register and sync jobs to complete
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Find the registered server
      const gameServerRes = (
        await this.client.gameserver.gameServerControllerSearch({
          filters: { identityToken: [gameServerIdentityToken] },
        })
      ).data.data;

      expect(gameServerRes).to.have.lengthOf(1);
      const gameServer = gameServerRes[0];

      // Query items - should have been automatically synced
      const itemsRes = await this.client.item.itemControllerSearch({
        filters: { gameserverId: [gameServer.id] },
      });

      // Verify that items were automatically synced
      expect(itemsRes.data.data.length).to.be.greaterThan(0);

      // Verify we have the expected mock items
      const itemCodes = itemsRes.data.data.map((item) => item.code);
      expect(itemCodes).to.include('wood');
      expect(itemCodes).to.include('stone');

      // Query entities - should have been automatically synced
      const entitiesRes = await this.client.entity.entityControllerSearch({
        filters: { gameserverId: [gameServer.id] },
      });

      // Verify that entities were automatically synced
      expect(entitiesRes.data.data.length).to.be.greaterThan(0);

      // Verify we have some expected mock entities
      const entityCodes = entitiesRes.data.data.map((entity) => entity.code);
      expect(entityCodes).to.include('zombie');
      expect(entityCodes).to.include('cow');

      await mockServer.shutdown();
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Message prefix is applied when sending messages',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      // Set the message prefix setting
      await this.client.settings.settingsControllerSet(SettingsOutputDTOKeyEnum.MessagePrefix, {
        value: '[TEST] ',
        gameServerId: this.setupData.gameServer1.id,
      });

      // Send a test message
      const testMessage = 'Hello world!';
      await this.client.gameserver.gameServerControllerSendMessage(this.setupData.gameServer1.id, {
        message: testMessage,
      });

      // Query for the chat message event
      const events = (
        await this.client.event.eventControllerSearch({
          filters: {
            eventName: [HookEvents.CHAT_MESSAGE],
          },
          sortBy: 'createdAt',
          sortDirection: 'desc',
          limit: 1,
        })
      ).data.data;

      // Verify the message contains the prefix
      expect(events.length).to.equal(1);
      const meta = events[0].meta as EventChatMessage;
      expect(meta.msg).to.equal('[TEST] Hello world!');
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Message prefix respects 300 character limit',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      // Set a long message prefix
      const prefix = '[VERY LONG PREFIX] ';
      await this.client.settings.settingsControllerSet(SettingsOutputDTOKeyEnum.MessagePrefix, {
        value: prefix,
        gameServerId: this.setupData.gameServer1.id,
      });

      // Send a very long message that would exceed 300 chars with prefix
      const longMessage = 'A'.repeat(290);
      await this.client.gameserver.gameServerControllerSendMessage(this.setupData.gameServer1.id, {
        message: longMessage,
      });

      // Query for the chat message event
      const events = (
        await this.client.event.eventControllerSearch({
          filters: {
            eventName: [HookEvents.CHAT_MESSAGE],
          },
          sortBy: 'createdAt',
          sortDirection: 'desc',
          limit: 1,
        })
      ).data.data;

      // Verify the total message is truncated to 300 characters
      expect(events.length).to.equal(1);
      const meta = events[0].meta as EventChatMessage;
      if (!meta.msg) throw new Error('Message is undefined');
      expect(meta.msg.length).to.equal(300);
      expect(meta.msg.startsWith(prefix)).to.be.true;
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Give item using UUID (database lookup)',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      // Get available items
      const itemsRes = await this.client.item.itemControllerSearch({
        filters: { gameserverId: [this.setupData.gameServer1.id] },
      });
      expect(itemsRes.data.data.length).to.be.greaterThan(0);

      const testItem = itemsRes.data.data[0];

      // Give item using UUID
      await this.client.gameserver.gameServerControllerGiveItem(
        this.setupData.gameServer1.id,
        this.setupData.pogs1[0].playerId,
        {
          name: testItem.id, // Using UUID
          amount: 5,
          quality: '1',
        },
      );

      // Verify the operation succeeded (no error thrown means success)
      expect(true).to.be.true;
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Give item using item code (direct)',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      // Give item using item code directly
      await this.client.gameserver.gameServerControllerGiveItem(
        this.setupData.gameServer1.id,
        this.setupData.pogs1[0].playerId,
        {
          name: 'wood', // Using item code directly
          amount: 10,
          quality: '2',
        },
      );

      // Verify the operation succeeded (no error thrown means success)
      expect(true).to.be.true;
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Give item fails with invalid UUID',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      try {
        await this.client.gameserver.gameServerControllerGiveItem(
          this.setupData.gameServer1.id,
          this.setupData.pogs1[0].playerId,
          {
            name: '00000000-0000-4000-8000-000000000000', // Valid UUID format but non-existent
            amount: 1,
            quality: '1',
          },
        );
        throw new Error('Should have thrown an error for invalid UUID');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        expect(error.response?.status).to.equal(404);
      }
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
