import { IntegrationTest, SetupGameServerPlayers, expect } from '@takaro/test';
import { PERMISSIONS } from '@takaro/auth';

const group = 'PlayerController';

const tests = [
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Assign role to player',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const permissions = await this.client.permissionCodesToInputs([PERMISSIONS.READ_GAMESERVERS]);

      const role = await this.client.role.roleControllerCreate({
        name: 'Test role',
        permissions,
      });
      const player = this.setupData.players[0];
      return this.client.player.playerControllerAssignRole(player.id, role.data.data.id);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Assigning the same role twice should fail',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const permissions = await this.client.permissionCodesToInputs([PERMISSIONS.READ_GAMESERVERS]);
      const role = await this.client.role.roleControllerCreate({
        name: 'Test role',
        permissions,
      });
      const player = this.setupData.players[0];
      await this.client.player.playerControllerAssignRole(player.id, role.data.data.id);
      return this.client.player.playerControllerAssignRole(player.id, role.data.data.id);
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Assigning the same role for different gameservers should work',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const permissions = await this.client.permissionCodesToInputs([PERMISSIONS.READ_GAMESERVERS]);
      const role = await this.client.role.roleControllerCreate({
        name: 'Test role',
        permissions,
      });
      const player = this.setupData.players[0];
      const player2 = this.setupData.players[1];
      await this.client.player.playerControllerAssignRole(player.id, role.data.data.id, {
        gameServerId: this.setupData.gameServer1.id,
      });
      return this.client.player.playerControllerAssignRole(player2.id, role.data.data.id, {
        gameServerId: this.setupData.gameServer2.id,
      });
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Assigning the same role for same gameserver should fail',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const permissions = await this.client.permissionCodesToInputs([PERMISSIONS.READ_GAMESERVERS]);
      const role = await this.client.role.roleControllerCreate({
        name: 'Test role',
        permissions,
      });
      const player = this.setupData.players[0];
      await this.client.player.playerControllerAssignRole(player.id, role.data.data.id, {
        gameServerId: this.setupData.gameServer1.id,
      });
      return this.client.player.playerControllerAssignRole(player.id, role.data.data.id, {
        gameServerId: this.setupData.gameServer1.id,
      });
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Can assign an expiring role to a player',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const permissions = await this.client.permissionCodesToInputs([PERMISSIONS.READ_GAMESERVERS]);
      const role = await this.client.role.roleControllerCreate({
        name: 'Test role',
        permissions,
      });
      const player = this.setupData.players[0];
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString();
      const assignRes = await this.client.player.playerControllerAssignRole(player.id, role.data.data.id, {
        expiresAt,
      });

      const playerRes = await this.client.player.playerControllerGetOne(player.id);
      expect(playerRes.data.data.roleAssignments[0].expiresAt).to.be.eq(expiresAt);

      return assignRes;
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Expired roles get deleted',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const permissions = await this.client.permissionCodesToInputs([PERMISSIONS.READ_GAMESERVERS]);
      const role = await this.client.role.roleControllerCreate({
        name: 'Test role',
        permissions,
      });
      const player = this.setupData.players[0];
      const expiresAt = new Date(Date.now() - 10).toISOString();
      await this.client.player.playerControllerAssignRole(player.id, role.data.data.id, {
        expiresAt,
      });

      const playerRes = await this.client.player.playerControllerGetOne(player.id);
      expect(playerRes.data.data.roleAssignments.find((a) => a.role.name === role.data.data.name)).to.be.undefined;
      return playerRes;
    },
    filteredFields: ['name', 'playerId', 'steamId', 'roleId', 'epicOnlineServicesId', 'xboxLiveId'],
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Handles expiring role of gameServer properly - expiring gameserver role',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      // Assign a global role with no expiry
      // Assign a different role for gameserver with expiry
      // -> Global role should still be there

      const permissions = await this.client.permissionCodesToInputs([PERMISSIONS.READ_GAMESERVERS]);
      const globalRole = await this.client.role.roleControllerCreate({
        name: 'Global role',
        permissions,
      });

      const gameServerRole = await this.client.role.roleControllerCreate({
        name: 'GameServer role',
        permissions,
      });

      const player = this.setupData.players[0];

      await this.client.player.playerControllerAssignRole(player.id, globalRole.data.data.id);
      await this.client.player.playerControllerAssignRole(player.id, gameServerRole.data.data.id, {
        gameServerId: this.setupData.gameServer1.id,
        expiresAt: new Date(Date.now() - 10).toISOString(),
      });

      const playerRes = await this.client.player.playerControllerGetOne(player.id);
      expect(playerRes.data.data.roleAssignments.find((a) => a.role.name === globalRole.data.data.name)).to.not.be
        .undefined;
      expect(playerRes.data.data.roleAssignments.find((a) => a.role.name === gameServerRole.data.data.name)).to.be
        .undefined;
      return playerRes;
    },
    filteredFields: ['name', 'playerId', 'steamId', 'roleId', 'epicOnlineServicesId', 'xboxLiveId'],
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Handles expiring role of gameServer properly - expiring global role',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      // Assign a global role with expiry
      // Assign a different role for gameserver with no expiry
      // -> Global role should be gone

      const permissions = await this.client.permissionCodesToInputs([PERMISSIONS.READ_GAMESERVERS]);
      const globalRole = await this.client.role.roleControllerCreate({
        name: 'Global role',
        permissions,
      });

      const gameServerRole = await this.client.role.roleControllerCreate({
        name: 'GameServer role',
        permissions,
      });

      const player = this.setupData.players[0];

      await this.client.player.playerControllerAssignRole(player.id, globalRole.data.data.id, {
        expiresAt: new Date(Date.now() - 10).toISOString(),
      });
      await this.client.player.playerControllerAssignRole(player.id, gameServerRole.data.data.id, {
        gameServerId: this.setupData.gameServer1.id,
      });

      const playerRes = await this.client.player.playerControllerGetOne(player.id);
      expect(playerRes.data.data.roleAssignments.find((a) => a.role.name === globalRole.data.data.name)).to.be
        .undefined;
      expect(playerRes.data.data.roleAssignments.find((a) => a.role.name === gameServerRole.data.data.name)).to.not.be
        .undefined;
      return playerRes;
    },
    filteredFields: ['name', 'playerId', 'steamId', 'roleId', 'gameServerId', 'epicOnlineServicesId', 'xboxLiveId'],
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
