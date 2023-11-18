import { IntegrationTest, expect, integrationConfig } from '@takaro/test';
import { IModuleTestsSetupData, modulesTestSetup } from './setupData.integration.test.js';
import { GameEvents } from '../dto/index.js';

const group = 'Module permissions role assignments';

async function cleanRoleSetup(this: IntegrationTest<IModuleTestsSetupData>) {
  const defaultSetup = await modulesTestSetup.bind(this)();

  const playersRes = await this.client.player.playerControllerSearch();

  const permissions = await this.client.permissionCodesToInputs(['TELEPORTS_USE']);

  await this.client.role.roleControllerUpdate(defaultSetup.role.id, {
    name: defaultSetup.role.name,
    permissions,
  });

  await this.client.gameserver.gameServerControllerInstallModule(
    defaultSetup.gameserver.id,
    defaultSetup.teleportsModule.id
  );

  await Promise.all(
    playersRes.data.data.map(async (player) => {
      await this.client.player.playerControllerRemoveRole(player.id, defaultSetup.role.id);
    })
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
      await this.client.player.playerControllerAssignRole(this.setupData.players[0].id, this.setupData.role.id);

      const setEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setEvents).length).to.be.eq(1);
      expect((await setEvents)[0].data.msg).to.be.eq('Teleport test set.');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: cleanRoleSetup,
    name: 'Player has role on other gameserver -> command denied',
    test: async function () {
      const newGameServer = await this.client.gameserver.gameServerControllerCreate({
        name: 'newServer',
        connectionInfo: JSON.stringify({
          host: integrationConfig.get('mockGameserver.host'),
        }),
        type: 'MOCK',
      });

      await this.client.player.playerControllerAssignRole(this.setupData.players[0].id, this.setupData.role.id, {
        gameServerId: newGameServer.data.data.id,
      });

      const setEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setEvents).length).to.be.eq(1);
      expect((await setEvents)[0].data.msg).to.be.eq('You do not have permission to use teleports.');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: cleanRoleSetup,
    name: 'Player has role on correct gameserver -> works',
    test: async function () {
      await this.client.player.playerControllerAssignRole(this.setupData.players[0].id, this.setupData.role.id, {
        gameServerId: this.setupData.gameserver.id,
      });

      const setEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setEvents).length).to.be.eq(1);
      expect((await setEvents)[0].data.msg).to.be.eq('Teleport test set.');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Uses system roles',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id,
        {
          userConfig: JSON.stringify({
            timeout: 0,
          }),
        }
      );

      await Promise.all(
        this.setupData.players.map(async (player) => {
          await this.client.player.playerControllerRemoveRole(player.id, this.setupData.role.id);
        })
      );

      const permissions = await this.client.permissionCodesToInputs(['TELEPORTS_USE']);
      const playerRoleRes = await this.client.role.roleControllerSearch({ filters: { name: ['Player'] } });
      await this.client.role.roleControllerUpdate(playerRoleRes.data.data[0].id, {
        name: 'Player',
        permissions,
      });

      const setTpEvent = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setTpEvent).length).to.be.eq(1);
      expect((await setTpEvent)[0].data.msg).to.be.eq('Teleport test set.');

      const tpEvent = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await tpEvent)[0].data.msg).to.be.eq('Teleported to test.');

      await this.client.role.roleControllerUpdate(playerRoleRes.data.data[0].id, {
        name: 'Player',
        permissions: [],
      });

      const tpEventNoPerm = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await tpEventNoPerm)[0].data.msg).to.be.eq('You do not have permission to use teleports.');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
