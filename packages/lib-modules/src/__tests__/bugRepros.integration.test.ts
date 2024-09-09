import { IntegrationTest, expect, IModuleTestsSetupData, modulesTestSetup, EventsAwaiter } from '@takaro/test';
import { GameEvents, HookEvents } from '../dto/index.js';
import { EventChatMessageChannelEnum } from '@takaro/apiclient';

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
        moduleId: mod.id,
        regex: 'test msg',
        eventType: 'chat-message',
        function: genFn('First'),
      });

      await this.client.hook.hookControllerCreate({
        name: 'Test hook 2',
        moduleId: mod.id,
        regex: 'test msg',
        eventType: 'chat-message',
        function: genFn('Second'),
      });

      await this.client.gameserver.gameServerControllerInstallModule(this.setupData.gameserver.id, mod.id);

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
        moduleId: mod.id,
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

      await this.client.gameserver.gameServerControllerInstallModule(this.setupData.gameserver.id, mod.id);

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
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
