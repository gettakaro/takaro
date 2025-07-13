import { IntegrationTest, expect, IModuleTestsSetupData, modulesTestSetup, EventsAwaiter } from '@takaro/test';
import { GameEvents } from '../dto/index.js';
import { describe } from 'node:test';

const group = 'help command suite';

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Shows all available commands when no argument provided',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.utilsModule.latestVersion.id,
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 3);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/help',
        playerId: this.setupData.players[0].id,
      });

      const messages = await events;
      expect(messages.length).to.be.greaterThan(0);
      expect(messages[0].data.meta.msg).to.include('Available commands:');
      // Should show help and ping commands from utils module
      expect(messages.some((m) => m.data.meta.msg.includes('help:'))).to.be.true;
      expect(messages.some((m) => m.data.meta.msg.includes('ping:'))).to.be.true;
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Shows specific command help when command name provided',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.utilsModule.latestVersion.id,
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/help ping',
        playerId: this.setupData.players[0].id,
      });

      const messages = await events;
      expect(messages.length).to.be.eq(1);
      expect(messages[0].data.meta.msg).to.include('ping:');
      expect(messages[0].data.meta.msg).to.include('pong');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Search returns commands with matching names',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.utilsModule.latestVersion.id,
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 2);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/help search ping',
        playerId: this.setupData.players[0].id,
      });

      const messages = await events;
      expect(messages.length).to.be.greaterThan(0);
      expect(messages[0].data.meta.msg).to.include('Commands matching "ping":');
      expect(messages.some((m) => m.data.meta.msg.includes('ping:'))).to.be.true;
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Search returns commands with matching help text',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.utilsModule.latestVersion.id,
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 2);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/help search pong',
        playerId: this.setupData.players[0].id,
      });

      const messages = await events;
      expect(messages.length).to.be.greaterThan(0);
      expect(messages[0].data.meta.msg).to.include('Commands matching "pong":');
      expect(messages.some((m) => m.data.meta.msg.includes('ping:'))).to.be.true;
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Search is case-insensitive',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.utilsModule.latestVersion.id,
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 2);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/help search PING',
        playerId: this.setupData.players[0].id,
      });

      const messages = await events;
      expect(messages.length).to.be.greaterThan(0);
      expect(messages[0].data.meta.msg).to.include('Commands matching "PING":');
      expect(messages.some((m) => m.data.meta.msg.includes('ping:'))).to.be.true;
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Search supports partial matches',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.utilsModule.latestVersion.id,
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 2);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/help search hel',
        playerId: this.setupData.players[0].id,
      });

      const messages = await events;
      expect(messages.length).to.be.greaterThan(0);
      expect(messages[0].data.meta.msg).to.include('Commands matching "hel":');
      expect(messages.some((m) => m.data.meta.msg.includes('help:'))).to.be.true;
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Search returns appropriate message when no matches found',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.utilsModule.latestVersion.id,
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/help search nonexistentcommand',
        playerId: this.setupData.players[0].id,
      });

      const messages = await events;
      expect(messages.length).to.be.eq(1);
      expect(messages[0].data.meta.msg).to.include('No commands found matching "nonexistentcommand"');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Search works across multiple modules',
    test: async function () {
      // Install utils module
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.utilsModule.latestVersion.id,
      });

      // Install another module (gimme) to have more commands
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.gimmeModule.latestVersion.id,
        userConfig: JSON.stringify({
          items: [],
          commands: ['say test'],
        }),
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 2);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/help search command',
        playerId: this.setupData.players[0].id,
      });

      const messages = await events;
      expect(messages.length).to.be.greaterThan(0);
      expect(messages[0].data.meta.msg).to.include('Commands matching "command":');
      // Should find help command which has "command" in its help text
      expect(messages.some((m) => m.data.meta.msg.includes('help:'))).to.be.true;
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
