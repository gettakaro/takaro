import { IntegrationTest } from '@takaro/test';
import { CAPABILITIES } from '../db/role';

const tests: IntegrationTest[] = [
  new IntegrationTest({
    group: 'Auth',
    name: 'Cannot access resource without capability',
    standardEnvironment: true,
    setup: async function () {
      await this.apiUtils.login(CAPABILITIES.READ_USERS);
    },
    url: '/role',
    method: 'get',
    expectedStatus: 403,
  }),
  new IntegrationTest({
    group: 'Auth',
    name: 'Can access resource with capability',
    standardEnvironment: true,
    filteredFields: ['roleId'],
    setup: async function () {
      await this.apiUtils.login(CAPABILITIES.READ_ROLES);
    },
    url: '/role?sortBy=name&sortDirection=asc',
    method: 'get',
    expectedStatus: 200,
  }),
];

describe('Auth integration tests', function () {
  tests.forEach((test) => {
    test.run();
  });
});
