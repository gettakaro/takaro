import { IntegrationTest, expect, IModuleTestsSetupData, modulesTestSetup, EventsAwaiter } from '@takaro/test';
import { HookEvents } from '../dto/index.js';

const group = 'System config - cooldown';

const customSetup = async function (this: IntegrationTest<IModuleTestsSetupData>): Promise<IModuleTestsSetupData> {
  const setupData = await modulesTestSetup.bind(this)();

  await this.client.gameserver.gameServerControllerInstallModule(setupData.gameserver.id, setupData.utilsModule.id, {
    systemConfig: JSON.stringify({
      commands: {
        ping: {
          cooldown: 60,
        },
      },
    }),
  });
  return setupData;
};

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Returns error when player tries to execute command that is on cooldown',
    test: async function () {
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.COMMAND_EXECUTED, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/ping',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(1);

      const events2 = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/ping',
        playerId: this.setupData.players[0].id,
      });

      expect((await events2).length).to.be.eq(1);
      expect((await events2)[0].data.meta.msg).to.match(
        /This command can only be executed once every 60 seconds\. You can execute it again at /,
      );
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Handles cooldown when using commands in rapid succession',
    test: async function () {
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CHAT_MESSAGE, 2);
      await Promise.all([
        this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
          msg: '/ping',
          playerId: this.setupData.players[0].id,
        }),
        this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
          msg: '/ping',
          playerId: this.setupData.players[0].id,
        }),
      ]);

      const sorted = (await events).sort((a, b) => a.data.meta.msg - b.data.meta.msg);
      expect(sorted.length).to.be.eq(2);
      expect(sorted[0].data.meta.msg).to.be.eq(
        'You can only execute one command at a time. Please wait for the previous command to finish.',
      );
      expect(sorted[1].data.meta.msg).to.be.eq('Pong!');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
