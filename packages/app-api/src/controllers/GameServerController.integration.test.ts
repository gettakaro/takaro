import { IntegrationTest } from '@takaro/test';
import { GameServerOutputDTO } from '../service/GameServerService';

const group = 'GameServerController';

const mockGameServer = {
  name: 'Test gameserver',
  connectionInfo: JSON.stringify({
    host: 'localhost',
    port: 1234,
  }),
};

const tests: IntegrationTest<any>[] = [
  new IntegrationTest<GameServerOutputDTO>({
    group,
    name: 'Get by ID',
    setup: async function () {
      return (
        await this.client.gameserver.gameServerControllerCreate(mockGameServer)
      ).data.data;
    },
    test: async function () {
      return this.client.gameserver.gameServerControllerGetOne(
        this.setupData.id
      );
    },
  }),
  new IntegrationTest<GameServerOutputDTO>({
    group,
    name: 'Create',
    test: async function () {
      return this.client.gameserver.gameServerControllerCreate(mockGameServer);
    },
  }),
  new IntegrationTest<GameServerOutputDTO>({
    group,
    name: 'Update',
    setup: async function () {
      return (
        await this.client.gameserver.gameServerControllerCreate(mockGameServer)
      ).data.data;
    },
    test: async function () {
      return this.client.gameserver.gameServerControllerUpdate(
        this.setupData.id,
        {
          name: 'Test gameserver 2',
          connectionInfo: JSON.stringify({
            host: 'somewhere.else',
            port: 9876,
          }),
        }
      );
    },
  }),
  new IntegrationTest<GameServerOutputDTO>({
    group,
    name: 'Delete',
    setup: async function () {
      return (
        await this.client.gameserver.gameServerControllerCreate(mockGameServer)
      ).data.data;
    },
    test: async function () {
      return this.client.gameserver.gameServerControllerRemove(
        this.setupData.id
      );
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
