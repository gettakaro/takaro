import { IntegrationTest, logInWithPermissions } from '@takaro/test';
import { RoleSearchInputDTOSortDirectionEnum } from '@takaro/apiclient';
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
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
