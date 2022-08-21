import { CAPABILITIES } from '@prisma/client';
import { IntegrationTest } from '@takaro/test';

const tests: IntegrationTest[] = [
  new IntegrationTest({
    group: 'RolesController',
    name: 'GET Basic fetch',
    standardEnvironment: true,
    setup: async function () {
      await this.apiUtils.createRole();
    },
    url: '/role?sortBy=name&sortDirection=asc',
    method: 'get',
  }),
  new IntegrationTest({
    group: 'RolesController',
    name: 'GET Basic fetch with filter',
    standardEnvironment: true,
    setup: async function () {
      await this.apiUtils.createRole('filter-name');
    },
    url: '/role?filters[name]=filter-name',
    method: 'get',
  }),
  new IntegrationTest({
    group: 'RolesController',
    name: 'GET Fetch one',
    standardEnvironment: true,
    setup: async function () {
      this.data = await this.apiUtils.createRole('cool-name');
    },
    url: function () {
      return `/role/${this.data.data.id}`;
    },
    method: 'get',
  }),
  new IntegrationTest({
    group: 'RolesController',
    name: 'POST Basic create',
    standardEnvironment: true,
    url: '/role',
    method: 'post',
    body: {
      name: 'auto-test-create',
      capabilities: [CAPABILITIES.READ_ROLES],
    },
  }),
  new IntegrationTest({
    group: 'RolesController',
    name: 'POST Create with invalid capabilities',
    standardEnvironment: true,
    url: '/role',
    method: 'post',
    body: {
      name: 'auto-test-create',
      capabilities: ['invalid-capability'],
    },
    expectedStatus: 400,
  }),
  new IntegrationTest({
    group: 'RolesController',
    name: 'POST Create with too long name',
    standardEnvironment: true,
    url: '/role',
    method: 'post',
    body: {
      name: 'this name is way too long - aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      capabilities: [CAPABILITIES.READ_ROLES],
    },
    expectedStatus: 400,
  }),
  new IntegrationTest({
    group: 'RolesController',
    name: 'POST Create with too short name',
    standardEnvironment: true,
    url: '/role',
    method: 'post',
    body: {
      name: 'a',
      capabilities: [CAPABILITIES.READ_ROLES],
    },
    expectedStatus: 400,
  }),
  new IntegrationTest({
    group: 'RolesController',
    name: 'POST Create with no name',
    standardEnvironment: true,
    url: '/role',
    method: 'post',
    body: {
      capabilities: [CAPABILITIES.READ_ROLES],
    },
    expectedStatus: 400,
  }),
  new IntegrationTest({
    group: 'RolesController',
    name: 'POST Create with no capabilities',
    standardEnvironment: true,
    url: '/role',
    method: 'post',
    body: {
      name: 'auto-test-create',
    },
    expectedStatus: 400,
  }),
  new IntegrationTest({
    group: 'RolesController',
    name: 'PUT Basic update',
    standardEnvironment: true,
    setup: async function () {
      this.data = await this.apiUtils.createRole('update-name');
    },
    url: function () {
      return `/role/${this.data.data.id}`;
    },
    method: 'put',
    body: {
      name: 'auto-test-update',
      capabilities: [CAPABILITIES.READ_ROLES],
    },
  }),
  new IntegrationTest({
    group: 'RolesController',
    name: 'PUT Update with invalid capabilities',
    standardEnvironment: true,
    setup: async function () {
      this.data = await this.apiUtils.createRole('update-name');
    },
    url: function () {
      return `/role/${this.data.data.id}`;
    },
    method: 'put',
    body: {
      name: 'auto-test-update',
      capabilities: ['invalid-capability'],
    },
    expectedStatus: 400,
  }),
  new IntegrationTest({
    group: 'RolesController',
    name: 'DELETE Basic delete',
    standardEnvironment: true,
    setup: async function () {
      this.data = await this.apiUtils.createRole('delete-name');
    },
    url: function () {
      return `/role/${this.data.data.id}`;
    },
    method: 'delete',
  }),
  new IntegrationTest({
    group: 'RolesController',
    name: 'DELETE Delete with invalid id',
    standardEnvironment: true,
    url: '/role/invalid-id',
    method: 'delete',
    expectedStatus: 400,
  }),
  new IntegrationTest({
    group: 'RolesController',
    name: 'DELETE Delete with non-existing id',
    standardEnvironment: true,
    url: '/role/f2357510-6f18-4177-a7ad-109c11d485f9',
    method: 'delete',
    expectedStatus: 404,
  }),
];

describe('Role controller', function () {
  tests.forEach((test) => {
    test.run();
  });
});
