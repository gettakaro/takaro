import { IntegrationTest, expect, IModuleTestsSetupData, modulesTestSetup, EventsAwaiter } from '@takaro/test';
import { GameEvents } from '../dto/index.js';
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
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
