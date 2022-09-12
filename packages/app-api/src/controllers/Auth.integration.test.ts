import { IntegrationTest, logInWithCapabilities } from '@takaro/test';
import { CAPABILITIES } from '../db/role';

const group = 'Auth';

const tests: IntegrationTest<any>[] = [
  new IntegrationTest({
    group,
    name: 'Cannot access resource without capability',
    setup: async function () {
      await logInWithCapabilities(this.client, [CAPABILITIES.READ_USERS]);
    },
    test: async function () {
      return this.client.role.roleControllerSearch();
    },
    expectedStatus: 403,
  }),
  new IntegrationTest({
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
