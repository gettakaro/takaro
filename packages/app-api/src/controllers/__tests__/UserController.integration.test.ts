import { IntegrationTest, expect } from '@takaro/test';
import { PERMISSIONS } from '@takaro/auth';
import { UserOutputDTO } from '@takaro/apiclient';

const group = 'UserController';

interface IUserSetup {
  user: UserOutputDTO;
}

const userSetup = async function (this: IntegrationTest<IUserSetup>) {
  const user = await this.client.user.userControllerCreate({
    name: 'Test user',
    idpId: 'test',
    email: 'testUser@example.com',
    password: 'test',
  });
  return { user: user.data.data };
};

const tests = [
  new IntegrationTest<IUserSetup>({
    group,
    snapshot: true,
    name: 'Can assign an expiring role to a user',
    setup: userSetup,
    test: async function () {
      const permissions = await this.client.permissionCodesToInputs([PERMISSIONS.MANAGE_GAMESERVERS]);
      const role = await this.client.role.roleControllerCreate({
        name: 'Test role',
        permissions,
      });
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString();
      const assignRes = await this.client.user.userControllerAssignRole(this.setupData.user.id, role.data.data.id, {
        expiresAt,
      });

      const userRes = await this.client.user.userControllerGetOne(this.setupData.user.id);
      expect(userRes.data.data.roles[0].expiresAt).to.be.eq(expiresAt);

      return assignRes;
    },
  }),
  new IntegrationTest<IUserSetup>({
    group,
    snapshot: true,
    name: 'Expired roles get deleted',
    setup: userSetup,
    test: async function () {
      const permissions = await this.client.permissionCodesToInputs([PERMISSIONS.MANAGE_GAMESERVERS]);
      const role = await this.client.role.roleControllerCreate({
        name: 'Test role',
        permissions,
      });
      const expiresAt = new Date(Date.now() - 10).toISOString();
      await this.client.user.userControllerAssignRole(this.setupData.user.id, role.data.data.id, {
        expiresAt,
      });

      const userRes = await this.client.user.userControllerGetOne(this.setupData.user.id);
      expect(userRes.data.data.roles.find((assignment) => assignment.role.name === 'Test role')).to.be.undefined;

      return userRes;
    },
    filteredFields: ['idpId', 'roleId', 'userId', 'lastSeen'],
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
