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
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
