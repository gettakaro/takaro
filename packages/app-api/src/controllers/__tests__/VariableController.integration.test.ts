import { IntegrationTest, expect, integrationConfig, EventsAwaiter, SetupGameServerPlayers } from '@takaro/test';
import { GameServerOutputDTO, ModuleOutputDTO, PlayerOutputDTO, VariableOutputDTO } from '@takaro/apiclient';
import { config } from '../../config.js';
import { EventTypes } from '@takaro/modules';

const group = 'VariableController';

const setup = async function (this: IntegrationTest<VariableOutputDTO>): Promise<VariableOutputDTO> {
  return (
    await this.client.variable.variableControllerCreate({
      key: 'Test variable',
      value: 'Test value',
    })
  ).data.data;
};

interface ISetupWithGameServersAndPlayers {
  gameServer1: GameServerOutputDTO;
  gameServer2: GameServerOutputDTO;
  players: PlayerOutputDTO[];
  mod: ModuleOutputDTO;
}

const setupWithGameServersAndPlayers = async function (
  this: IntegrationTest<ISetupWithGameServersAndPlayers>
): Promise<ISetupWithGameServersAndPlayers> {
  const gameServer1 = await this.client.gameserver.gameServerControllerCreate({
    name: 'Gameserver 1',
    type: 'MOCK',
    connectionInfo: JSON.stringify({
      host: integrationConfig.get('mockGameserver.host'),
    }),
  });

  const gameServer2 = await this.client.gameserver.gameServerControllerCreate({
    name: 'Gameserver 2',
    type: 'MOCK',
    connectionInfo: JSON.stringify({
      host: integrationConfig.get('mockGameserver.host'),
    }),
  });

  const mod = (
    await this.client.module.moduleControllerCreate({
      name: 'Test module',
    })
  ).data.data;

  const eventsAwaiter = new EventsAwaiter();
  await eventsAwaiter.connect(this.client);
  const connectedEvents = eventsAwaiter.waitForEvents(EventTypes.PLAYER_CONNECTED, 10);

  await Promise.all([
    this.client.gameserver.gameServerControllerExecuteCommand(gameServer1.data.data.id, { command: 'connectAll' }),
    this.client.gameserver.gameServerControllerExecuteCommand(gameServer2.data.data.id, { command: 'connectAll' }),
  ]);

  await connectedEvents;

  const players = (await this.client.player.playerControllerSearch()).data.data;

  return {
    gameServer1: gameServer1.data.data,
    gameServer2: gameServer2.data.data,
    players,
    mod,
  };
};

const tests = [
  new IntegrationTest<VariableOutputDTO>({
    group,
    snapshot: true,
    name: 'Get by ID',
    setup,
    test: async function () {
      return this.client.variable.variableControllerFindOne(this.setupData.id);
    },
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Create',
    test: async function () {
      return this.client.variable.variableControllerCreate({
        key: 'Test variable',
        value: 'Test value',
      });
    },
  }),
  new IntegrationTest<VariableOutputDTO>({
    group,
    snapshot: true,
    name: 'Update',
    setup,
    test: async function () {
      return this.client.variable.variableControllerUpdate(this.setupData.id, {
        key: 'Updated variable',
        value: 'Updated value',
      });
    },
  }),
  new IntegrationTest<VariableOutputDTO>({
    group,
    snapshot: true,
    name: 'Delete',
    setup,
    test: async function () {
      const res = await this.client.variable.variableControllerDelete(this.setupData.id);

      // Check that the variable is deleted
      await expect(this.client.variable.variableControllerFindOne(this.setupData.id)).to.be.rejectedWith('404');

      return res;
    },
  }),
  new IntegrationTest<VariableOutputDTO>({
    group,
    snapshot: true,
    name: 'Prevents creating duplicate variables',
    setup,
    test: async function () {
      return this.client.variable.variableControllerCreate({
        key: this.setupData.key,
        value: 'Test value',
      });
    },
    expectedStatus: 409,
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Same key but different gameServerId is allowed',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      await this.client.variable.variableControllerCreate({
        key: 'Variable',
        value: 'Test value',
        gameServerId: this.setupData.gameServer1.id,
      });

      return this.client.variable.variableControllerCreate({
        key: 'Variable',
        value: 'Test value',
        gameServerId: this.setupData.gameServer2.id,
      });
    },
    filteredFields: ['gameServerId'],
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Same key but different playerId is allowed',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      await this.client.variable.variableControllerCreate({
        key: 'Variable',
        value: 'Test value',
        playerId: this.setupData.players[0].id,
      });

      return this.client.variable.variableControllerCreate({
        key: 'Variable',
        value: 'Test value',
        playerId: this.setupData.players[1].id,
      });
    },
    filteredFields: ['playerId'],
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Same key, same playerId and different gameServerId is allowed',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      await this.client.variable.variableControllerCreate({
        key: 'Variable',
        value: 'Test value',
        playerId: this.setupData.players[0].id,
        gameServerId: this.setupData.gameServer1.id,
      });

      return this.client.variable.variableControllerCreate({
        key: 'Variable',
        value: 'Test value',
        playerId: this.setupData.players[0].id,
        gameServerId: this.setupData.gameServer2.id,
      });
    },
    filteredFields: ['gameServerId', 'playerId'],
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Same key, same gameServerId and different playerId is allowed',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      await this.client.variable.variableControllerCreate({
        key: 'Variable',
        value: 'Test value',
        playerId: this.setupData.players[0].id,
        gameServerId: this.setupData.gameServer1.id,
      });

      return this.client.variable.variableControllerCreate({
        key: 'Variable',
        value: 'Test value',
        playerId: this.setupData.players[1].id,
        gameServerId: this.setupData.gameServer1.id,
      });
    },
    filteredFields: ['gameServerId', 'playerId'],
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Same key, same playerId and same gameServerId is not allowed',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      await this.client.variable.variableControllerCreate({
        key: 'Variable',
        value: 'Test value',
        playerId: this.setupData.players[0].id,
        gameServerId: this.setupData.gameServer1.id,
      });

      return this.client.variable.variableControllerCreate({
        key: 'Variable',
        value: 'Test value',
        playerId: this.setupData.players[0].id,
        gameServerId: this.setupData.gameServer1.id,
      });
    },
    expectedStatus: 409,
    filteredFields: ['gameServerId', 'playerId'],
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Can query API with playerId',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      await this.client.variable.variableControllerCreate({
        key: 'Variable',
        value: 'Test value',
        playerId: this.setupData.players[0].id,
      });

      await this.client.variable.variableControllerCreate({
        key: 'Variable',
        value: 'Test value',
        playerId: this.setupData.players[1].id,
      });

      const res = await this.client.variable.variableControllerFind({
        filters: {
          playerId: this.setupData.players[0].id,
        },
      });

      expect(res.data.data.length).to.equal(1);
      expect(res.data.data[0].playerId).to.equal(this.setupData.players[0].id);

      return res;
    },
    filteredFields: ['gameServerId', 'playerId'],
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Can query API with gameServerId',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      await this.client.variable.variableControllerCreate({
        key: 'Variable',
        value: 'Test value',
        gameServerId: this.setupData.gameServer1.id,
      });

      await this.client.variable.variableControllerCreate({
        key: 'Variable',
        value: 'Test value',
        gameServerId: this.setupData.gameServer2.id,
      });

      const res = await this.client.variable.variableControllerFind({
        filters: {
          gameServerId: this.setupData.gameServer1.id,
        },
      });

      expect(res.data.data.length).to.equal(1);
      expect(res.data.data[0].gameServerId).to.equal(this.setupData.gameServer1.id);

      return res;
    },
    filteredFields: ['gameServerId', 'playerId'],
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: `Prevents creating more than config.get('takaro.maxVariables') (${config.get(
      'takaro.maxVariables'
    )}) variables`,
    setup: async function (this: IntegrationTest<void>): Promise<void> {
      const chunkSize = Math.ceil(config.get('takaro.maxVariables') / 10);

      // Create vars in batches of 1/10th total size
      for (let i = 0; i < 10; i++) {
        await Promise.all(
          Array(chunkSize)
            .fill(null)
            .map((_, j) =>
              this.client.variable.variableControllerCreate({
                key: `Test variable ${i * chunkSize + j}`,
                value: 'Test value',
              })
            )
        );
      }

      return;
    },
    test: async function () {
      return this.client.variable.variableControllerCreate({
        key: 'umpeenth variable',
        value: 'Test value',
      });
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<ISetupWithGameServersAndPlayers>({
    group,
    snapshot: true,
    name: 'Create with moduleId',
    setup: setupWithGameServersAndPlayers,
    test: async function () {
      return this.client.variable.variableControllerCreate({
        key: 'Test variable',
        value: 'Test value',
        moduleId: this.setupData.mod.id,
      });
    },
    filteredFields: ['moduleId'],
  }),
  new IntegrationTest<ISetupWithGameServersAndPlayers>({
    group,
    snapshot: true,
    name: 'Prevents creating duplicate variables with same moduleId',
    setup: setupWithGameServersAndPlayers,
    test: async function () {
      // First creation should succeed
      await this.client.variable.variableControllerCreate({
        key: 'Test variable',
        value: 'Test value',
        moduleId: this.setupData.mod.id,
      });

      // Second creation with same moduleId should fail
      return this.client.variable.variableControllerCreate({
        key: 'Test variable',
        value: 'Test value',
        moduleId: this.setupData.mod.id,
      });
    },
    expectedStatus: 409, // Expect a conflict HTTP status code
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
