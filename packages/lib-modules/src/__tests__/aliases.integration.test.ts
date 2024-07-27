import { IntegrationTest, expect, IModuleTestsSetupData, modulesTestSetup } from '@takaro/test';
import { GameEvents } from '../dto/index.js';

const group = 'Aliases';

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Can install and use aliases',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id,
        {
          systemConfig: JSON.stringify({
            commands: {
              teleport: {
                delay: 0,
                aliases: ['tp', 'tellyport'],
              },
            },
          }),
        },
      );

      const setEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setEvents).length).to.be.eq(1);
      expect((await setEvents)[0].data.msg).to.be.eq('Teleport test set.');

      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tellyport test',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.be.eq('Teleported to test.');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
