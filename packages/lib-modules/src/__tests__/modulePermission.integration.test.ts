import { IntegrationTest, expect, integrationConfig } from '@takaro/test';
import { IModuleTestsSetupData, modulesTestSetup } from './setupData.integration.test.js';
import { GameEvents } from '../dto/index.js';

const group = 'Module permissions role assignments';

async function cleanRoleSetup(this: IntegrationTest<IModuleTestsSetupData>) {
  const defaultSetup = await modulesTestSetup.bind(this)();

  const playersRes = await this.client.player.playerControllerSearch();

  const permissionsRes = await this.client.role.roleControllerGetPermissions();
  const teleportsPermission = permissionsRes.data.data.find((p) => p.permission === 'TELEPORTS_USE');

  if (!teleportsPermission) throw new Error('Teleports permission not found');

  await this.client.role.roleControllerUpdate(defaultSetup.role.id, {
    name: defaultSetup.role.name,
    permissions: [teleportsPermission.id],
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
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
