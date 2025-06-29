import { IntegrationTest, expect, IModuleTestsSetupData, modulesTestSetup, EventsAwaiter } from '@takaro/test';
import { GameEvents } from '../dto/index.js';
import { describe } from 'vitest';

const group = 'Aliases';

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Can install and use aliases',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.teleportsModule.latestVersion.id,
        systemConfig: JSON.stringify({
          commands: {
            teleport: {
              delay: 0,
              aliases: ['tp', 'tellyport'],
            },
          },
        }),
      });

      const setEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setEvents).length).to.equal(1);
      expect((await setEvents)[0].data.meta.msg).to.equal('Teleport test set.');

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tellyport test',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.equal(1);
      expect((await events)[0].data.meta.msg).to.equal('Teleported to test.');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Aliases are case insensitive',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.teleportsModule.latestVersion.id,
        systemConfig: JSON.stringify({
          commands: {
            teleport: {
              delay: 0,
              aliases: ['tp', 'tellyport'],
            },
          },
        }),
      });

      const setEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setEvents).length).to.equal(1);
      expect((await setEvents)[0].data.meta.msg).to.equal('Teleport test set.');

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/TelLyPoRt test',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.equal(1);
      expect((await events)[0].data.meta.msg).to.equal('Teleported to test.');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
