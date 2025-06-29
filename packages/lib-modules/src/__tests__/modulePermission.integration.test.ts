import { IntegrationTest, expect, IModuleTestsSetupData, modulesTestSetup, EventsAwaiter } from '@takaro/test';
import { GameEvents } from '../dto/index.js';
import { describe } from 'vitest';
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

      const setEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setEvents).length).to.equal(1);
      expect((await setEvents)[0].data.meta.msg).to.equal('Teleport test set.');
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

      const setEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setEvents).length).to.equal(1);
      expect((await setEvents)[0].data.meta.msg).to.equal('You do not have permission to use teleports.');
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

      const setEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setEvents).length).to.equal(1);
      expect((await setEvents)[0].data.meta.msg).to.equal('Teleport test set.');
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

      const setTpEvent = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setTpEvent).length).to.equal(1);
      expect((await setTpEvent)[0].data.meta.msg).to.equal('Teleport test set.');

      const tpEvent = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await tpEvent)[0].data.meta.msg).to.equal('Teleported to test.');

      await this.client.role.roleControllerUpdate(playerRoleRes.data.data[0].id, {
        name: 'Player',
        permissions: [],
      });

      const tpEventNoPerm = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await tpEventNoPerm)[0].data.meta.msg).to.equal('You do not have permission to use teleports.');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
