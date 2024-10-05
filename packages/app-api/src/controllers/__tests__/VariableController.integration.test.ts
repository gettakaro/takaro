import { IntegrationTest, expect, SetupGameServerPlayers } from '@takaro/test';
import { VariableOutputDTO } from '@takaro/apiclient';
import { config } from '../../config.js';

const group = 'VariableController';

const setup = async function (this: IntegrationTest<VariableOutputDTO>): Promise<VariableOutputDTO> {
  return (
    await this.client.variable.variableControllerCreate({
      key: 'Test variable',
      value: 'Test value',
    })
  ).data.data;
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

      const res = await this.client.variable.variableControllerSearch({
        filters: {
          playerId: [this.setupData.players[0].id],
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

      const res = await this.client.variable.variableControllerSearch({
        filters: {
          gameServerId: [this.setupData.gameServer1.id],
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
      'takaro.maxVariables',
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
              }),
            ),
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
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Create with moduleId',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      return this.client.variable.variableControllerCreate({
        key: 'Test variable',
        value: 'Test value',
        moduleId: this.setupData.mod.id,
      });
    },
    filteredFields: ['moduleId'],
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Prevents creating duplicate variables with same moduleId',
    setup: SetupGameServerPlayers.setup,
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
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Can create expiring variables',
    setup: SetupGameServerPlayers.setup,
    filteredFields: ['expiresAt'],
    test: async function () {
      const res = await this.client.variable.variableControllerCreate({
        key: 'Test variable',
        value: 'Test value',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      });

      expect(res.data.data.expiresAt).to.not.be.null;

      return res;
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Create var without expiry and update with expiry',
    setup: SetupGameServerPlayers.setup,
    filteredFields: ['expiresAt'],
    test: async function () {
      const res = await this.client.variable.variableControllerCreate({
        key: 'Test variable',
        value: 'Test value',
      });

      expect(res.data.data.expiresAt).to.be.null;

      const secondRes = await this.client.variable.variableControllerUpdate(res.data.data.id, {
        expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        value: 'Updated value',
      });

      expect(secondRes.data.data.expiresAt).to.not.be.null;

      return secondRes;
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Create var with expiry in the past, fetching it should return 404',
    setup: SetupGameServerPlayers.setup,
    filteredFields: ['expiresAt'],
    test: async function () {
      const createRes = await this.client.variable.variableControllerCreate({
        key: 'Test variable',
        value: 'Test value',
        expiresAt: new Date(Date.now() - 100).toISOString(),
      });

      await expect(this.client.variable.variableControllerFindOne(createRes.data.data.id)).to.be.rejectedWith('404');
    },
    expectedStatus: 404,
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Can remove expiration date of existing var',
    setup: SetupGameServerPlayers.setup,
    filteredFields: ['expiresAt'],
    test: async function () {
      const createRes = await this.client.variable.variableControllerCreate({
        key: 'Test variable',
        value: 'Test value',
        expiresAt: new Date(Date.now() + 5000).toISOString(),
      });

      const updateRes = await this.client.variable.variableControllerUpdate(createRes.data.data.id, {
        value: 'Updated value',
      });

      expect(updateRes.data.data.expiresAt).to.be.null;
    },
    expectedStatus: 404,
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
