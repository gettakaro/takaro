import { IntegrationTest, expect, IModuleTestsSetupData, modulesTestSetup, EventsAwaiter } from '@takaro/test';
import { GameEvents } from '../dto/index.js';
import { describe } from 'node:test';

const group = 'DefaultSystemConfig Aliases';

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    name: 'Custom module with defaultSystemConfig aliases should work after installation',
    setup: modulesTestSetup,
    test: async function () {
      // Create a module with defaultSystemConfig containing aliases
      const mod = (
        await this.client.module.moduleControllerCreate({
          name: 'Test Module With Default Aliases',
          latestVersion: {
            description: 'Testing defaultSystemConfig aliases',
            defaultSystemConfig: JSON.stringify({
              commands: {
                pingcommand: {
                  aliases: ['pong', 'pp'],
                },
              },
            }),
          },
        })
      ).data.data;

      // Create a command in the module
      await this.client.command.commandControllerCreate({
        name: 'pingcommand',
        description: 'Test ping command',
        trigger: 'ping',
        versionId: mod.latestVersion.id,
        function: `import { data, takaro } from '@takaro/helpers';
          async function main() {
            await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
              message: 'command executed via alias',
            });
          }
          await main();`,
      });

      // Install the module WITHOUT providing explicit systemConfig
      // This should use the defaultSystemConfig with aliases
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: mod.latestVersion.id,
      });

      // Try to trigger the command using the alias from defaultSystemConfig
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/pong', // Using the alias from defaultSystemConfig
        playerId: this.setupData.players[0].id,
      });

      // Verify the command executed
      const receivedEvents = await events;
      expect(receivedEvents.length).to.be.eq(1);
      expect(receivedEvents[0].data.meta.msg).to.be.eq('command executed via alias');
    },
  }),

  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    name: 'Custom module aliases work when explicitly provided during installation',
    setup: modulesTestSetup,
    test: async function () {
      // Create a module with defaultSystemConfig containing aliases
      const mod = (
        await this.client.module.moduleControllerCreate({
          name: 'Test Module Explicit Aliases',
          latestVersion: {
            description: 'Testing explicit aliases',
            defaultSystemConfig: JSON.stringify({
              commands: {
                echocommand: {
                  aliases: ['defaultalias'],
                },
              },
            }),
          },
        })
      ).data.data;

      await this.client.command.commandControllerCreate({
        name: 'echocommand',
        description: 'Test echo command',
        trigger: 'echo',
        versionId: mod.latestVersion.id,
        function: `import { data, takaro } from '@takaro/helpers';
          async function main() {
            await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
              message: 'command executed',
            });
          }
          await main();`,
      });

      // Install the module WITH explicit systemConfig (overriding defaults)
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: mod.latestVersion.id,
        systemConfig: JSON.stringify({
          commands: {
            echocommand: {
              aliases: ['explicitalias', 'ea'],
            },
          },
        }),
      });

      // Verify explicit alias works
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/explicitalias',
        playerId: this.setupData.players[0].id,
      });

      const receivedEvents = await events;
      expect(receivedEvents.length).to.be.eq(1);
      expect(receivedEvents[0].data.meta.msg).to.be.eq('command executed');
    },
  }),

  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    name: 'Multiple aliases from defaultSystemConfig should all work',
    setup: modulesTestSetup,
    test: async function () {
      const mod = (
        await this.client.module.moduleControllerCreate({
          name: 'Test Module Multiple Aliases',
          latestVersion: {
            description: 'Testing multiple aliases',
            defaultSystemConfig: JSON.stringify({
              commands: {
                testcmd: {
                  aliases: ['alias1', 'alias2', 'alias3'],
                },
              },
            }),
          },
        })
      ).data.data;

      await this.client.command.commandControllerCreate({
        name: 'testcmd',
        description: 'Test command',
        trigger: 'test',
        versionId: mod.latestVersion.id,
        function: `import { data, takaro } from '@takaro/helpers';
          async function main() {
            await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
              message: 'success',
            });
          }
          await main();`,
      });

      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: mod.latestVersion.id,
      });

      // Test each alias
      for (const alias of ['alias1', 'alias2', 'alias3']) {
        const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

        await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
          msg: `/${alias}`,
          playerId: this.setupData.players[0].id,
        });

        const receivedEvents = await events;
        expect(receivedEvents.length).to.be.eq(1);
        expect(receivedEvents[0].data.meta.msg).to.be.eq('success');
      }
    },
  }),
];

describe(group, () => {
  tests.forEach((test) => {
    test.run();
  });
});
