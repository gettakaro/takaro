import {
  IntegrationTest,
  expect,
  IModuleTestsSetupData,
  modulesTestSetup,
  chatMessageSorter,
  EventsAwaiter,
} from '@takaro/test';
import { IHookEventTypeEnum } from '@takaro/apiclient';
import { describe } from 'node:test';

const group = 'Help command';

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Help command responds with a list of installed commands',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.utilsModule.latestVersion.id,
      });
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(IHookEventTypeEnum.ChatMessage, 3);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/help',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(3);
      const sortedEvents = (await events).sort(chatMessageSorter);

      expect(sortedEvents[0].data.meta.msg).to.be.eq('Available commands:');
      expect(sortedEvents[1].data.meta.msg).to.be.eq(
        'help: The text you are reading right now, displays information about commands.',
      );
      expect(sortedEvents[2].data.meta.msg).to.be.eq(
        'ping: Replies with pong, useful for testing if the connection works.',
      );
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Help command responds with a list of installed commands, picking up commands from multiple modules',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.utilsModule.latestVersion.id,
      });
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.teleportsModule.latestVersion.id,
      });
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(IHookEventTypeEnum.ChatMessage, 13);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/help',
        playerId: this.setupData.players[0].id,
      });

      const sortedEvents = (await events).sort(chatMessageSorter);

      expect(sortedEvents[0].data.meta.msg).to.be.eq('Available commands:');
      expect(sortedEvents[1].data.meta.msg).to.be.eq('deletetp: Deletes a location.');
      expect(sortedEvents[2].data.meta.msg).to.be.eq('deletewaypoint: Deletes a waypoint.');
      expect(sortedEvents[3].data.meta.msg).to.be.eq(
        'help: The text you are reading right now, displays information about commands.',
      );
      expect(sortedEvents[4].data.meta.msg).to.be.eq('listwaypoints: Lists all waypoints.');
      expect(sortedEvents[5].data.meta.msg).to.be.eq(
        'ping: Replies with pong, useful for testing if the connection works.',
      );
      expect(sortedEvents[6].data.meta.msg).to.be.eq(
        'setprivate: Sets a teleport to be private, only the teleport owner can teleport to it.',
      );
      expect(sortedEvents[7].data.meta.msg).to.be.eq(
        'setpublic: Sets a teleport to be public, allowing other players to teleport to it.',
      );
      expect(sortedEvents[8].data.meta.msg).to.be.eq('settp: Sets a location to teleport to.');
      expect(sortedEvents[9].data.meta.msg).to.be.eq('setwaypoint: Creates a new waypoint.');
      expect(sortedEvents[10].data.meta.msg).to.be.eq('teleport: Teleports to one of your set locations.');
      expect(sortedEvents[11].data.meta.msg).to.be.eq(
        'teleportwaypoint: Placeholder command, this will not be used directly. The module will install aliases for this command corresponding to the waypoint names.',
      );
      expect(sortedEvents[12].data.meta.msg).to.be.eq('tplist: Lists all your set locations.');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Help command responds with detailed info about a specific command',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.utilsModule.latestVersion.id,
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(IHookEventTypeEnum.ChatMessage, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/help ping',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(1);
      const sortedEvents = (await events).sort(chatMessageSorter);

      expect(sortedEvents[0].data.meta.msg).to.be.eq(
        'ping: Replies with pong, useful for testing if the connection works.',
      );
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Help command responds with unknown command message if command does not exist',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.utilsModule.latestVersion.id,
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(IHookEventTypeEnum.ChatMessage, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/help foobar',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.meta.msg).to.be.eq(
        'Unknown command "foobar", use this command without arguments to see all available commands.',
      );
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Help command filters out commands without permissions',
    test: async function () {
      // Install utils module and economyUtils module
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.utilsModule.latestVersion.id,
      });
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.economyUtilsModule.latestVersion.id,
      });

      // Remove any existing roles from the player to ensure they have no special permissions
      // Remove the default role that gets assigned in test setup
      await this.client.player.playerControllerRemoveRole(this.setupData.players[0].id, this.setupData.role.id);

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(IHookEventTypeEnum.ChatMessage, 9);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/help',
        playerId: this.setupData.players[0].id,
      });

      const sortedEvents = (await events).sort(chatMessageSorter);

      expect(sortedEvents[0].data.meta.msg).to.be.eq('Available commands:');
      // Should NOT see grantCurrency and revokeCurrency commands as they require permissions
      const commandMessages = sortedEvents.slice(1).map((event) => event.data.meta.msg);
      expect(commandMessages).to.not.include.members([
        'grantCurrency: Grant money to a player. The money is not taken from your own balance but is new currency.',
        'revokeCurrency: Revokes money from a player. The money disappears.',
      ]);
      // Should see commands without permission requirements
      expect(commandMessages).to.include.members([
        'balance: Check your balance.',
        'transfer: Transfer money to another player.',
        'help: The text you are reading right now, displays information about commands.',
        'ping: Replies with pong, useful for testing if the connection works.',
      ]);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Help command shows permission-restricted commands to authorized players',
    test: async function () {
      // Install modules
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.utilsModule.latestVersion.id,
      });
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.economyUtilsModule.latestVersion.id,
      });

      // Create a role with ECONOMY_UTILS_MANAGE_CURRENCY permission
      const permissions = await this.client.permissionCodesToInputs(['ECONOMY_UTILS_MANAGE_CURRENCY']);
      const roleRes = await this.client.role.roleControllerCreate({
        name: 'Currency Manager',
        permissions,
      });

      // Assign the role to the player
      await this.client.player.playerControllerAssignRole(this.setupData.players[0].id, roleRes.data.data.id);

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(IHookEventTypeEnum.ChatMessage, 11);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/help',
        playerId: this.setupData.players[0].id,
      });

      const sortedEvents = (await events).sort(chatMessageSorter);

      expect(sortedEvents[0].data.meta.msg).to.be.eq('Available commands:');
      // Should see grantCurrency and revokeCurrency commands now
      const commandMessages = sortedEvents.slice(1).map((event) => event.data.meta.msg);
      expect(commandMessages).to.include.members([
        'grantCurrency: Grant money to a player. The money is not taken from your own balance but is new currency.',
        'revokeCurrency: Revokes money from a player. The money disappears.',
      ]);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Help command shows permission error for specific restricted command',
    test: async function () {
      // Install modules
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.utilsModule.latestVersion.id,
      });
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.economyUtilsModule.latestVersion.id,
      });

      // Remove any existing roles from the player
      // Remove the default role that gets assigned in test setup
      await this.client.player.playerControllerRemoveRole(this.setupData.players[0].id, this.setupData.role.id);

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(IHookEventTypeEnum.ChatMessage, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/help grantCurrency',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.meta.msg).to.be.eq(
        'You don\'t have permission to use the "grantCurrency" command.',
      );
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: async function () {
      const defaultSetup = await modulesTestSetup.bind(this)();

      // Remove all modules to create a scenario with no commands
      const installedModules = await this.client.module.moduleInstallationsControllerGetInstalledModules({
        filters: { gameserverId: [defaultSetup.gameserver.id] },
      });

      await Promise.all(
        installedModules.data.data.map(async (mod) => {
          await this.client.module.moduleInstallationsControllerUninstallModule(
            defaultSetup.gameserver.id,
            mod.moduleId,
          );
        }),
      );

      // Only install utils module (which contains the help command itself)
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: defaultSetup.gameserver.id,
        versionId: defaultSetup.utilsModule.latestVersion.id,
      });

      return defaultSetup;
    },
    name: 'Help command shows correct message when player has access to some but not all commands',
    test: async function () {
      // Install modules with mixed permission requirements
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.economyUtilsModule.latestVersion.id,
      });
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.teleportsModule.latestVersion.id,
      });

      // Give player permission for teleports but not economy management
      const permissions = await this.client.permissionCodesToInputs(['TELEPORTS_USE']);
      const roleRes = await this.client.role.roleControllerCreate({
        name: 'Teleports Only',
        permissions,
      });

      // Remove existing roles and assign new one
      // Remove the default role that gets assigned in test setup
      await this.client.player.playerControllerRemoveRole(this.setupData.players[0].id, this.setupData.role.id);
      await this.client.player.playerControllerAssignRole(this.setupData.players[0].id, roleRes.data.data.id);

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(IHookEventTypeEnum.ChatMessage, 16);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/help',
        playerId: this.setupData.players[0].id,
      });

      const sortedEvents = (await events).sort(chatMessageSorter);
      const commandMessages = sortedEvents.slice(1).map((event) => event.data.meta.msg);

      // Should see teleport commands
      expect(commandMessages.some((msg) => msg.includes('teleport:'))).to.be.true;
      expect(commandMessages.some((msg) => msg.includes('settp:'))).to.be.true;

      // Should NOT see economy management commands
      expect(commandMessages).to.not.include.members([
        'grantCurrency: Grant money to a player. The money is not taken from your own balance but is new currency.',
        'revokeCurrency: Revokes money from a player. The money disappears.',
      ]);

      // Should still see commands without permission requirements
      expect(commandMessages.some((msg) => msg.includes('balance:'))).to.be.true;
      expect(commandMessages.some((msg) => msg.includes('help:'))).to.be.true;
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
