import { IntegrationTest, SetupGameServerPlayers } from '@takaro/test';
import { PERMISSIONS } from '@takaro/auth';

const group = 'PlayerController';

const tests = [
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Assign role to player',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const role = await this.client.role.roleControllerCreate({
        name: 'Test role',
        permissions: [PERMISSIONS.READ_GAMESERVERS],
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
      const role = await this.client.role.roleControllerCreate({
        name: 'Test role',
        permissions: [PERMISSIONS.READ_GAMESERVERS],
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
      const role = await this.client.role.roleControllerCreate({
        name: 'Test role',
        permissions: [PERMISSIONS.READ_GAMESERVERS],
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
      const role = await this.client.role.roleControllerCreate({
        name: 'Test role',
        permissions: [PERMISSIONS.READ_GAMESERVERS],
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
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
