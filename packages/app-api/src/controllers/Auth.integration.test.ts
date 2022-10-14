import { IntegrationTest, logInWithCapabilities } from '@takaro/test';
import { RoleSearchInputDTOSortDirectionEnum } from '@takaro/apiclient';
import { CAPABILITIES } from '../db/role';

const group = 'Auth';

const tests = [
  new IntegrationTest({
    snapshot: true,
    group,
    name: 'Cannot access resource without capability',
    setup: async function () {
      await logInWithCapabilities(this.client, [CAPABILITIES.READ_USERS]);
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
    name: 'Can access resource with capability',
    filteredFields: ['roleId'],
    setup: async function () {
      await logInWithCapabilities(this.client, [CAPABILITIES.READ_ROLES]);
    },
    test: async function () {
      return this.client.role.roleControllerSearch();
    },
    expectedStatus: 200,
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
