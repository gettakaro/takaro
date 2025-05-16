import { IntegrationTest, expect, SetupGameServerPlayers, integrationConfig } from '@takaro/test';
import { EventChatMessage, GameServerCreateDTOTypeEnum, GameServerOutputDTO, isAxiosError } from '@takaro/apiclient';
import { describe } from 'node:test';
import { HookEvents } from '@takaro/modules';

const group = 'GameServerController';

const mockGameServer = {
  name: 'Test gameserver',
  connectionInfo: JSON.stringify({
    host: integrationConfig.get('mockGameserver.host'),
  }),
  type: GameServerCreateDTOTypeEnum.Mock,
};

const tests = [
  new IntegrationTest<GameServerOutputDTO>({
    group,
    snapshot: true,
    name: 'Get by ID',
    setup: async function () {
      return (await this.client.gameserver.gameServerControllerCreate(mockGameServer)).data.data;
    },
    test: async function () {
      return this.client.gameserver.gameServerControllerGetOne(this.setupData.id);
    },
    filteredFields: ['connectionInfo'],
  }),
  new IntegrationTest<GameServerOutputDTO>({
    group,
    snapshot: true,
    name: 'Create',
    test: async function () {
      return this.client.gameserver.gameServerControllerCreate(mockGameServer);
    },
    filteredFields: ['connectionInfo'],
  }),
  new IntegrationTest<GameServerOutputDTO>({
    group,
    snapshot: true,
    name: 'Update',
    setup: async function () {
      return (await this.client.gameserver.gameServerControllerCreate(mockGameServer)).data.data;
    },
    test: async function () {
      return this.client.gameserver.gameServerControllerUpdate(this.setupData.id, {
        name: 'Test gameserver 2',
        connectionInfo: JSON.stringify({
          host: 'somewhere.else',
          port: 9876,
        }),
        type: GameServerCreateDTOTypeEnum.Mock,
      });
    },
  }),
  new IntegrationTest<GameServerOutputDTO>({
    group,
    snapshot: true,
    name: 'Delete',
    setup: async function () {
      return (await this.client.gameserver.gameServerControllerCreate(mockGameServer)).data.data;
    },
    test: async function () {
      return this.client.gameserver.gameServerControllerRemove(this.setupData.id);
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
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
