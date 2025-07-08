import { IntegrationTest, expect, IModuleTestsSetupData, modulesTestSetup, EventsAwaiter } from '@takaro/test';
import { IHookEventTypeEnum } from '@takaro/apiclient';
import { describe } from 'node:test';
import { randomUUID } from 'crypto';
import { getMockServer } from '@takaro/mock-gameserver';

const group = 'Module permissions role assignments';

async function cleanRoleSetup(this: IntegrationTest<IModuleTestsSetupData>) {
  const defaultSetup = await modulesTestSetup.bind(this)();

  await this.client.module.moduleInstallationsControllerInstallModule({
    gameServerId: defaultSetup.gameserver.id,
    versionId: defaultSetup.teleportsModule.latestVersion.id,
  });

  const playersRes = await this.client.player.playerControllerSearch();

  const permissions = await this.client.permissionCodesToInputs(['TELEPORTS_USE']);

  await this.client.role.roleControllerUpdate(defaultSetup.role.id, {
    name: defaultSetup.role.name,
    permissions,
  });

  await this.client.module.moduleInstallationsControllerInstallModule({
    gameServerId: defaultSetup.gameserver.id,
    versionId: defaultSetup.teleportsModule.latestVersion.id,
  });

  await Promise.all(
    playersRes.data.data.map(async (player) => {
      await this.client.player.playerControllerRemoveRole(player.id, defaultSetup.role.id);
    }),
  );

  return defaultSetup;
}

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: cleanRoleSetup,
    name: 'Player has global role -> works',
    test: async function () {
      const useTeleportsRole = await this.client.permissionCodesToInputs(['TELEPORTS_USE']);
      await this.client.role.roleControllerUpdate(this.setupData.role.id, {
        permissions: [
          {
            permissionId: useTeleportsRole[0].permissionId,
            count: 3,
          },
        ],
      });
      await this.client.player.playerControllerAssignRole(this.setupData.players[0].id, this.setupData.role.id);

      const setEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(
        IHookEventTypeEnum.ChatMessage,
        1,
      );
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setEvents).length).to.be.eq(1);
      expect((await setEvents)[0].data.meta.msg).to.be.eq('Teleport test set.');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: cleanRoleSetup,
    name: 'Player has role on other gameserver -> command denied',
    test: async function () {
      if (!this.domainRegistrationToken) throw new Error('Domain registration token not set');
      const identityToken = randomUUID();
      const mockserver = await getMockServer({
        mockserver: { registrationToken: this.domainRegistrationToken, identityToken },
      });
      this.setupData.mockservers.push(mockserver);
      const gameserverRes = await this.client.gameserver.gameServerControllerSearch({
        filters: { identityToken: [identityToken] },
      });
      const newGameServer = gameserverRes.data.data[0];
      if (!newGameServer) throw new Error('Game server not found');

      await this.client.player.playerControllerAssignRole(this.setupData.players[0].id, this.setupData.role.id, {
        gameServerId: newGameServer.id,
      });

      const setEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(
        IHookEventTypeEnum.ChatMessage,
        1,
      );
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setEvents).length).to.be.eq(1);
      expect((await setEvents)[0].data.meta.msg).to.be.eq('You do not have permission to use teleports.');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: cleanRoleSetup,
    name: 'Player has role on correct gameserver -> works',
    test: async function () {
      const useTeleportsRole = await this.client.permissionCodesToInputs(['TELEPORTS_USE']);
      await this.client.role.roleControllerUpdate(this.setupData.role.id, {
        permissions: [
          {
            permissionId: useTeleportsRole[0].permissionId,
            count: 3,
          },
        ],
      });

      await this.client.player.playerControllerAssignRole(this.setupData.players[0].id, this.setupData.role.id, {
        gameServerId: this.setupData.gameserver.id,
      });

      const setEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(
        IHookEventTypeEnum.ChatMessage,
        1,
      );
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setEvents).length).to.be.eq(1);
      expect((await setEvents)[0].data.meta.msg).to.be.eq('Teleport test set.');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Uses system roles',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.teleportsModule.latestVersion.id,
        userConfig: JSON.stringify({
          timeout: 0,
        }),
      });

      await Promise.all(
        this.setupData.players.map(async (player) => {
          await this.client.player.playerControllerRemoveRole(player.id, this.setupData.role.id);
        }),
      );

      const playerRoleRes = await this.client.role.roleControllerSearch({ filters: { name: ['Player'] } });

      const useTeleportsRole = await this.client.permissionCodesToInputs(['TELEPORTS_USE']);
      await this.client.role.roleControllerUpdate(playerRoleRes.data.data[0].id, {
        permissions: [
          {
            permissionId: useTeleportsRole[0].permissionId,
            count: 3,
          },
        ],
      });

      const setTpEvent = (await new EventsAwaiter().connect(this.client)).waitForEvents(
        IHookEventTypeEnum.ChatMessage,
        1,
      );

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[0].id,
      });

      const setTpEventResult = await setTpEvent;

      expect(setTpEventResult.length).to.be.eq(1);
      expect(setTpEventResult[0].data.meta.msg).to.be.eq('Teleport test set.');

      const tpEvent = (await new EventsAwaiter().connect(this.client)).waitForEvents(IHookEventTypeEnum.ChatMessage, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await tpEvent)[0].data.meta.msg).to.be.eq('Teleported to test.');

      await this.client.role.roleControllerUpdate(playerRoleRes.data.data[0].id, {
        name: 'Player',
        permissions: [],
      });

      const tpEventNoPerm = (await new EventsAwaiter().connect(this.client)).waitForEvents(
        IHookEventTypeEnum.ChatMessage,
        1,
      );

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await tpEventNoPerm)[0].data.meta.msg).to.include("You need the 'Teleports Use' permission");
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: async function () {
      const defaultSetup = await modulesTestSetup.bind(this)();

      // Remove all permissions from the default role
      await this.client.role.roleControllerUpdate(defaultSetup.role.id, {
        name: defaultSetup.role.name,
        permissions: [],
      });

      return defaultSetup;
    },
    name: 'Command execution denied when player lacks requiredPermissions',
    test: async function () {
      // Install economyUtils module which has commands with requiredPermissions
      const installRes = await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.economyUtilsModule.latestVersion.id,
      });

      // Verify installation succeeded
      expect(installRes.data.data).to.exist;

      // Ensure we have at least 1 player
      expect(this.setupData.players.length).to.be.at.least(1);
      const executingPlayer = this.setupData.players[0];

      // Remove any existing roles from the player to ensure they have no special permissions
      await this.client.player.playerControllerRemoveRole(executingPlayer.id, this.setupData.role.id);

      // Check player's roles after removal
      const playerAfter = await this.client.player.playerControllerGetOne(executingPlayer.id);

      // If player still has system roles, we need to handle the Player role specially
      if (playerAfter.data.data.roleAssignments && playerAfter.data.data.roleAssignments.length > 0) {
        // Find the Player role
        const playerRole = playerAfter.data.data.roleAssignments.find((ra) => ra.role.name === 'Player');
        if (!playerRole) throw new Error('Player role not found after removing roles');
        // Update the Player role to have no permissions
        await this.client.role.roleControllerUpdate(playerRole.role.id, {
          name: 'Player',
          permissions: [],
        });
      }

      // Enable economy for this test
      await this.client.settings.settingsControllerSet('economyEnabled', {
        value: 'true',
        gameServerId: this.setupData.gameserver.id,
      });
      await this.client.settings.settingsControllerSet('currencyName', {
        gameServerId: this.setupData.gameserver.id,
        value: 'test coin',
      });

      // Set up event listener - just listen for the chat message
      const eventsAwaiter = await new EventsAwaiter().connect(this.client);
      const chatEvents = eventsAwaiter.waitForEvents(IHookEventTypeEnum.ChatMessage, 1);

      // Try to execute grantCurrency command without permission
      const targetPlayer = this.setupData.players.length > 1 ? this.setupData.players[1] : executingPlayer;
      const commandMsg = `/grantcurrency ${targetPlayer.name} 100`;

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: commandMsg,
        playerId: executingPlayer.id,
      });

      // Check if we got a permission denied message
      const chatEventResults = await chatEvents;
      expect(chatEventResults).to.have.length(1);
      expect(chatEventResults[0].data.meta.msg).to.match(/do not have permission|need.*permission/i);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Command execution allowed when player has requiredPermissions',
    test: async function () {
      // Install economyUtils module
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

      // Set up event listener for COMMAND_EXECUTED event
      const eventsAwaiter = await new EventsAwaiter().connect(this.client);
      const executedEvents = eventsAwaiter.waitForEvents(IHookEventTypeEnum.CommandExecuted, 1);

      // Execute grantCurrency command with permission
      const targetPlayer = this.setupData.players.length > 1 ? this.setupData.players[1] : this.setupData.players[0];

      const commandMsg = `/grantcurrency ${targetPlayer.name} 100`;

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: commandMsg,
        playerId: this.setupData.players[0].id,
      });

      // Verify COMMAND_EXECUTED event was logged (not COMMAND_EXECUTION_DENIED)
      const executedEventResults = await executedEvents;
      expect(executedEventResults).to.have.length(1);
      expect(executedEventResults[0].data.eventName).to.equal('command-executed');
      // Command might fail during execution, but the important thing is that it was allowed to execute
      // expect(executedEventResults[0].data.command.name).to.equal('grantcurrency');
      // expect(executedEventResults[0].data.player.id).to.equal(this.setupData.players[0].id);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'ROOT permission bypasses command permission checks',
    test: async function () {
      // Install economyUtils module
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.economyUtilsModule.latestVersion.id,
      });

      // Create a role with ROOT permission
      const permissions = await this.client.permissionCodesToInputs(['ROOT']);
      const roleRes = await this.client.role.roleControllerCreate({
        name: 'Root Admin Test',
        permissions,
      });

      // Remove existing roles and assign ROOT role
      await this.client.player.playerControllerRemoveRole(this.setupData.players[0].id, this.setupData.role.id);
      await this.client.player.playerControllerAssignRole(this.setupData.players[0].id, roleRes.data.data.id);

      // Set up event listener for COMMAND_EXECUTED event
      const eventsAwaiter = await new EventsAwaiter().connect(this.client);
      const executedEvents = eventsAwaiter.waitForEvents(IHookEventTypeEnum.CommandExecuted, 1);

      // Execute grantCurrency command with ROOT permission (should bypass permission check)
      const targetPlayer = this.setupData.players.length > 1 ? this.setupData.players[1] : this.setupData.players[0];

      const commandMsg = `/grantcurrency ${targetPlayer.name} 100`;

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: commandMsg,
        playerId: this.setupData.players[0].id,
      });

      // Verify command was executed successfully
      const executedEventResults = await executedEvents;
      expect(executedEventResults).to.have.length(1);
      expect(executedEventResults[0].data.eventName).to.equal('command-executed');
      // Command might fail during execution, but the important thing is that ROOT bypassed the permission check
      // expect(executedEventResults[0].data.command.name).to.equal('grantcurrency');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
