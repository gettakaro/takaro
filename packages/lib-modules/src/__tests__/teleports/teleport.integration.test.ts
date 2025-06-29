import { IntegrationTest, expect, IModuleTestsSetupData, modulesTestSetup, EventsAwaiter } from '@takaro/test';
import { GameEvents } from '../../dto/index.js';
import { describe } from 'vitest';

const group = 'Teleports suite';

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Can teleport with /tp',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.teleportsModule.latestVersion.id,
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
        msg: '/tp test',
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
    name: 'Shows an error when teleporting to a non-existing teleport',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.teleportsModule.latestVersion.id,
      });
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.equal(1);
      expect((await events)[0].data.meta.msg).to.equal('Teleport test does not exist.');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Times out when teleporting faster than set timeout',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.teleportsModule.latestVersion.id,
        userConfig: JSON.stringify({
          timeout: 5000,
        }),
      });

      const setTpEvent = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setTpEvent).length).to.equal(1);

      const tpEvent = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await tpEvent)[0].data.meta.msg).to.equal('Teleported to test.');

      const tpTimeoutEvent = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await tpTimeoutEvent)[0].data.meta.msg).to.equal(
        'You cannot teleport yet. Please wait before trying again.',
      );
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Can teleport with dimension parameter through API endpoint',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.teleportsModule.latestVersion.id,
      });

      // First, set a teleport with a specific dimension via command
      const setEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp dimension_test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setEvents).length).to.equal(1);
      expect((await setEvents)[0].data.meta.msg).to.equal('Teleport dimension_test set.');

      // Now teleport using the API endpoint with a specific dimension
      await this.client.gameserver.gameServerControllerTeleportPlayer(
        this.setupData.gameserver.id,
        this.setupData.players[0].id,
        {
          x: 100,
          y: 200,
          z: 300,
          dimension: 'nether',
        },
      );

      // Verify that the teleport command works with the saved teleport (which includes dimension)
      const tpEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp dimension_test',
        playerId: this.setupData.players[0].id,
      });

      expect((await tpEvents).length).to.equal(1);
      expect((await tpEvents)[0].data.meta.msg).to.equal('Teleported to dimension_test.');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
