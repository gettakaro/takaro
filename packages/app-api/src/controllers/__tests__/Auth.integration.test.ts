import { integrationConfig, IntegrationTest, logInWithPermissions, expect } from '@takaro/test';
import { Client, RoleSearchInputDTOSortDirectionEnum, isAxiosError } from '@takaro/apiclient';
import { PERMISSIONS } from '@takaro/auth';

const group = 'Auth';

const tests = [
  new IntegrationTest({
    snapshot: true,
    group,
    name: 'Cannot access resource without permissions',
    setup: async function () {
      await logInWithPermissions(this.client, [PERMISSIONS.READ_USERS]);
    },
    test: async function () {
      return this.client.role.roleControllerSearch({
        sortBy: 'name',
        sortDirection: RoleSearchInputDTOSortDirectionEnum.Desc,
      });
    },
    expectedStatus: 403,
  }),
  new IntegrationTest({
    snapshot: true,
    group,
    name: 'Can access resource with permissions',
    filteredFields: ['roleId', 'permissionId'],
    setup: async function () {
      await logInWithPermissions(this.client, [PERMISSIONS.READ_ROLES]);
    },
    test: async function () {
      return this.client.role.roleControllerSearch({
        sortBy: 'name',
        sortDirection: RoleSearchInputDTOSortDirectionEnum.Desc,
      });
    },
    expectedStatus: 200,
  }),
  new IntegrationTest({
    snapshot: true,
    group,
    name: '[agent flow] can request a token from API to execute jobs',
    filteredFields: ['token'],
    test: async function () {
      if (!this.standardDomainId) throw new Error('No domain ID');
      const tokenRes = await this.adminClient.domain.domainControllerGetToken({
        domainId: this.standardDomainId,
      });

      const client = new Client({
        auth: {
          token: tokenRes.data.data.token,
        },
        url: integrationConfig.get('host'),
      });

      const res = await client.gameserver.gameServerControllerSearch({});
      expect(res.status).to.equal(200);
      return res;
    },
  }),
  new IntegrationTest({
    snapshot: true,
    group,
    name: 'Uses the system role user for API checks',
    test: async function () {
      await this.client.user.userControllerCreate({
        email: 'nopermissions@example.com',
        name: 'No Permissions',
        password: 'password',
      });

      const lowPermissionClient = new Client({
        auth: {
          username: 'nopermissions@example.com',
          password: 'password',
        },
        url: integrationConfig.get('host'),
      });

      await lowPermissionClient.login();

      try {
        await lowPermissionClient.user.userControllerSearch({});
        throw new Error('Should have thrown');
      } catch (error) {
        if (!isAxiosError(error)) throw new Error('Should have been an axios error');
        expect(error.response?.status).to.equal(403);
      }

      const rolesRes = await this.client.role.roleControllerSearch({ filters: { name: ['User'] } });
      const readUsersPerm = await this.client.permissionCodesToInputs([PERMISSIONS.READ_USERS]);
      await this.client.role.roleControllerUpdate(rolesRes.data.data[0].id, {
        name: 'User',
        permissions: readUsersPerm,
      });

      const usersRes = await lowPermissionClient.user.userControllerSearch({ sortBy: 'name' });
      expect(usersRes.data.data.length).to.equal(2);
      return usersRes;
    },
    filteredFields: ['idpId', 'roleId', 'email', 'permissionId', 'userId', 'lastSeen'],
  }),
];

describe(group, () => {
  tests.forEach((test) => {
    test.run();
  });
});
