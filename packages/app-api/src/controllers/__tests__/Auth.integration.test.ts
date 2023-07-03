import { integrationConfig, IntegrationTest, logInWithPermissions, expect } from '@takaro/test';
import { Client, RoleSearchInputDTOSortDirectionEnum } from '@takaro/apiclient';
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
    filteredFields: ['roleId'],
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
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
