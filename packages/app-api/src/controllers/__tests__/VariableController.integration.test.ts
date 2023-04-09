import { IntegrationTest, expect } from '@takaro/test';
import { VariableOutputDTO } from '@takaro/apiclient';
import { config } from '../../config';

const group = 'VariableController';

const setup = async function (
  this: IntegrationTest<VariableOutputDTO>
): Promise<VariableOutputDTO> {
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
      const res = await this.client.variable.variableControllerDelete(
        this.setupData.id
      );

      // Check that the variable is deleted
      await expect(
        this.client.variable.variableControllerFindOne(this.setupData.id)
      ).to.be.rejectedWith('404');

      return res;
    },
  }),
  new IntegrationTest<VariableOutputDTO>({
    group,
    snapshot: true,
    name: 'Prevents creating duplicate variables',
    setup,
    test: async function () {
      await this.client.variable.variableControllerCreate({
        key: this.setupData.key,
        value: 'Test value',
      });
    },
    expectedStatus: 409,
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
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
