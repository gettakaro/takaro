import { IntegrationTest, expect, IModuleTestsSetupData, modulesTestSetup, EventsAwaiter } from '@takaro/test';
import { GameEvents, HookEvents } from '../dto/index.js';
import { EventChatMessageChannelEnum } from '@takaro/apiclient';
import { randomUUID } from 'crypto';

const group = 'Bug repros';

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    name: 'Bug repro: can trigger 2 hooks for the same event inside a single module',
    setup: modulesTestSetup,
    test: async function () {
      const genFn = (param: string) => {
        return `import { data, takaro } from '@takaro/helpers';
        async function main() {
            const { player } = data;
            await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
                message: '${param} hook',
            });
        }
        await main();`;
      };

      const mod = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      // Add the buggy hooks
      await this.client.hook.hookControllerCreate({
        name: 'Test hook 1',
        versionId: mod.latestVersion.id,
        regex: 'test msg',
        eventType: 'chat-message',
        function: genFn('First'),
      });

      await this.client.hook.hookControllerCreate({
        name: 'Test hook 2',
        versionId: mod.latestVersion.id,
        regex: 'test msg',
        eventType: 'chat-message',
        function: genFn('Second'),
      });

      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: mod.latestVersion.id,
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 2);

      await this.client.hook.hookControllerTrigger({
        eventType: 'chat-message',
        gameServerId: this.setupData.gameserver.id,
        moduleId: mod.id,
        playerId: this.setupData.players[0].id,
        eventMeta: {
          msg: 'test msg',
          channel: EventChatMessageChannelEnum.Global,
        },
      });

      expect((await events).length).to.be.eq(2);
      expect((await events).map((e) => e.data.meta.msg)).to.include.members(['First hook', 'Second hook']);
    },
  }),
  // Before, the event "hook-executed" would not have the correct result logs saved
  // The TakaroDTO validation was rejecting it because "not a string"
  // `An instance of TakaroEventHookExecuted has failed the validation:\n - property result.logs[1].msg has failed the following constraints: isString \n - property result.logs[2].msg has failed the following constraints: isString \n"`
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    name: 'Bug repro: console.log in a function works with objects',
    setup: modulesTestSetup,
    test: async function () {
      const mod = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      await this.client.hook.hookControllerCreate({
        name: 'Test hook 1',
        versionId: mod.latestVersion.id,
        regex: 'test msg',
        eventType: 'chat-message',
        function: `import { data, takaro } from '@takaro/helpers';
        async function main() {
          console.log("foo");
          console.log({ foo: "bar" });
          console.log(["baz", 1]);
        }
        await main();`,
      });

      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: mod.latestVersion.id,
      });

      const listener = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.HOOK_EXECUTED, 1);

      await this.client.hook.hookControllerTrigger({
        eventType: 'chat-message',
        gameServerId: this.setupData.gameserver.id,
        moduleId: mod.id,
        playerId: this.setupData.players[0].id,
        eventMeta: {
          msg: 'test msg',
          channel: EventChatMessageChannelEnum.Global,
        },
      });

      const result = (await listener)[0].data.meta.result;
      expect(result.success).to.be.true;
      const logs = result.logs;
      const msgs = logs.map((l: any) => l.msg);
      expect(msgs).to.include.members(['foo', JSON.stringify({ foo: 'bar' }), JSON.stringify(['baz', 1])]);
    },
  }),
  /**
   * Repro for https://github.com/gettakaro/takaro/issues/1047
   * System config uses the names of functions to create structure
   * If a module is installed, and you then rename the function, the system config will be broken
   */
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    name: 'Bug repro: renaming functions breaks system config #1047',
    setup: modulesTestSetup,
    test: async function () {
      const mod = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      const createdCommand = await this.client.command.commandControllerCreate({
        name: 'testcmd',
        versionId: mod.latestVersion.id,
        trigger: 'testpong',
        function: `import { data, takaro } from '@takaro/helpers';
        async function main() {
            const { player } = data;
            await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
                message: 'pong',
            });
        }
        await main();`,
      });

      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: mod.latestVersion.id,
        userConfig: JSON.stringify({}),
        systemConfig: JSON.stringify({ commands: { testcmd: { aliases: ['foobar'] } } }),
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/foobar',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.meta.msg).to.be.eq('pong');

      // Rename the function
      await this.client.command.commandControllerUpdate(createdCommand.data.data.id, { name: 'testcmd2' });

      const eventsAfter = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/foobar',
        playerId: this.setupData.players[0].id,
      });

      expect((await eventsAfter).length).to.be.eq(1);
      expect((await eventsAfter)[0].data.meta.msg).to.be.eq('pong');
    },
  }),
  /**
   * Repro for https://github.com/gettakaro/takaro/issues/1405
   * When providing invalid code, Takaro trips over itself and throws a nasty error
   * Instead, it should catch it properly and return an actionable message for the user
   */
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    name: 'Bug repro: invalid module code throws bad error #1405',
    setup: modulesTestSetup,
    test: async function () {
      const mod = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      await this.client.command.commandControllerCreate({
        name: 'testcmd',
        versionId: mod.latestVersion.id,
        trigger: 'test',
        // Yes, very bad code! This is what a user might accidentally do
        function: `import { data, takaro } from '@takaro/helpers';

          const messed = (await takaro.variable.variableControllerSearch({ search: { key: [\`object Object\`] } })).data.data
          for (const thisVar of messed) {
            let originalString = thisVar.key;
            let newString = originalString.replace("[object Object]", "2024-09-20");

            await takaro.variable.variableControllerUpdate(thisVar.id, { key: newString, value: thisVar.value });

          }
          data.player.pm(\`done\`).
          `,
      });

      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: mod.latestVersion.id,
        userConfig: JSON.stringify({}),
        systemConfig: JSON.stringify({}),
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.COMMAND_EXECUTED, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/test',
        playerId: this.setupData.players[0].id,
      });

      console.log(JSON.stringify((await events)[0].data.meta.result, null, 2));
      const result = (await events)[0].data.meta.result;
      expect(result.success).to.be.false;
      expect(result.reason).to.include('SyntaxError: Unexpected end of input.');
    },
  }),
  /**
   * Create a module with a version and command that returns a 'hello world' message and tag it
   * Install the module and trigger the command
   * Then, edit the command so it returns a 'goodbye world' message and tag the module again
   * Trigger the command again and check if the message is 'goodbye world'   *
   */
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    name: 'Bug repro: command code not updated after tag change',
    setup: modulesTestSetup,
    test: async function () {
      const mod = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      const createdCommand = await this.client.command.commandControllerCreate({
        name: 'testcmd',
        versionId: mod.latestVersion.id,
        trigger: 'test',
        function: `import { data, takaro } from '@takaro/helpers';
        async function main() {
            const { player } = data;
            await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
                message: 'hello world',
            });
        }
        await main();`,
      });

      const tagRes1 = await this.client.module.moduleVersionControllerTagVersion({
        moduleId: mod.id,
        tag: '0.0.1',
      });

      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: tagRes1.data.data.id,
        userConfig: JSON.stringify({}),
        systemConfig: JSON.stringify({}),
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/test',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.meta.msg).to.be.eq('hello world');

      // Update the command
      await this.client.command.commandControllerUpdate(createdCommand.data.data.id, {
        function: `import { data, takaro } from '@takaro/helpers';
        async function main() {
            const { player } = data;
            await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
              message: 'goodbye world',
            });
        }
        await main();`,
      });

      const tagRes2 = await this.client.module.moduleVersionControllerTagVersion({
        moduleId: mod.id,
        tag: '0.0.2',
      });

      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: tagRes2.data.data.id,
        userConfig: JSON.stringify({}),
        systemConfig: JSON.stringify({}),
      });

      const eventsAfter = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/test',
        playerId: this.setupData.players[0].id,
      });

      expect((await eventsAfter).length).to.be.eq(1);
      expect((await eventsAfter)[0].data.meta.msg).to.be.eq('goodbye world');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    name: 'Bug repro: permissions from old module versions cleanly transfer when upgrading',
    setup: modulesTestSetup,
    /**
     * Scenario:
     * Module with PermA, v0.0.1 is installed
     * User then tags v0.0.2 and installs this
     * Players with permA can still use the module function that requires that permission
     */
    test: async function () {
      const permission = 'USE_TEST_PERMISSION';
      const module = (
        await this.client.module.moduleControllerCreate({
          name: randomUUID(),
          latestVersion: {
            permissions: [{ permission, canHaveCount: false, friendlyName: 'test', description: 'blabla test' }],
          },
        })
      ).data.data;

      await this.client.command.commandControllerCreate({
        name: 'test',
        versionId: module.latestVersion.id,
        trigger: 'test',
        function: `import { data, takaro, checkPermission } from '@takaro/helpers';
        async function main() {
            const { player, pog } = data;

              if (!checkPermission(pog, '${permission}')) {
                await takaro.gameserver.gameServerControllerSendMessage('${this.setupData.gameserver.id}', {
                    message: 'no permission',
                });
              } else {
                await takaro.gameserver.gameServerControllerSendMessage('${this.setupData.gameserver.id}', {
                    message: 'yes permission',
                });               
              }

        }
        await main();`,
      });

      // Create version 0.0.1
      const v1 = (
        await this.client.module.moduleVersionControllerTagVersion({
          moduleId: module.id,
          tag: '0.0.1',
        })
      ).data.data;

      // Install this version
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: v1.id,
      });

      // Create a role with the permission
      const permissionCode = await this.client.permissionCodesToInputs([permission]);
      const role = (await this.client.role.roleControllerCreate({ name: 'testing role', permissions: permissionCode }))
        .data.data;

      // Assign the role to a player
      await this.client.player.playerControllerAssignRole(this.setupData.players[0].id, role.id);

      // Firing the command should return 'yes permission'
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/test',
        playerId: this.setupData.players[0].id,
      });

      expect((await events)[0].data.meta.msg).to.be.eq('yes permission');

      // Tag a new version
      const v2 = (
        await this.client.module.moduleVersionControllerTagVersion({
          moduleId: module.id,
          tag: '0.0.2',
        })
      ).data.data;

      // Install this version
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: v2.id,
      });

      // Firing the command should return 'yes permission'
      const eventsAfter = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/test',
        playerId: this.setupData.players[0].id,
      });

      expect((await eventsAfter)[0].data.meta.msg).to.be.eq('yes permission');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
