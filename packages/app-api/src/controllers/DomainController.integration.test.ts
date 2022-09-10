import { IntegrationTest } from '@takaro/test';

const tests: IntegrationTest[] = [
  new IntegrationTest({
    group: 'DomainController',
    name: 'GET no auth',
    standardEnvironment: true,
    url: '/domain',
    method: 'get',
    expectedStatus: 401,
  }),
  new IntegrationTest({
    group: 'DomainController',
    name: 'POST no auth',
    standardEnvironment: true,
    url: '/domain',
    method: 'post',
    expectedStatus: 401,
  }),
  new IntegrationTest({
    group: 'DomainController',
    name: 'PUT no auth',
    standardEnvironment: true,
    url: '/domain/aaa',
    method: 'put',
    expectedStatus: 401,
  }),
  new IntegrationTest({
    group: 'DomainController',
    name: 'DELETE no auth',
    standardEnvironment: true,
    url: '/domain/aaa',
    method: 'delete',
    expectedStatus: 401,
  }),
  new IntegrationTest({
    group: 'DomainController',
    name: 'GET Basic list with filters',
    standardEnvironment: true,
    setup: async function () {
      this.data = await this.apiUtils.createDomain('filter-name');
    },
    url: '/domain?filters[name]=filter-name',
    method: 'get',
    expectedStatus: 200,
    adminAuth: true,
  }),
  new IntegrationTest({
    group: 'DomainController',
    name: 'POST create',
    standardEnvironment: true,
    filteredFields: ['password', 'passwordHash', 'roleId'],
    url: '/domain',
    method: 'post',
    teardown: async function () {
      if (this.response.body) {
        await this.apiUtils.deleteDomain(this.response.body.data.domain.id);
      }
    },
    body: {
      name: 'auto-test-create',
    },
    expectedStatus: 200,
    adminAuth: true,
  }),
  new IntegrationTest({
    group: 'DomainController',
    name: 'POST create with too long name',
    standardEnvironment: true,
    url: '/domain',
    method: 'post',
    body: {
      name: 'this name is way too long - aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    },
    expectedStatus: 400,
    adminAuth: true,
  }),
  new IntegrationTest({
    group: 'DomainController',
    name: 'POST create with too short name',
    standardEnvironment: true,
    url: '/domain',
    method: 'post',
    body: {
      name: 'a',
    },
    expectedStatus: 400,
    adminAuth: true,
  }),
  new IntegrationTest({
    group: 'DomainController',
    name: 'PUT update',
    standardEnvironment: true,
    setup: async function () {
      this.data = await this.apiUtils.createDomain('auto-test-update');
    },
    url: function () {
      return `/domain/${this.data.id}`;
    },
    method: 'put',
    body: {
      name: 'auto-test-update2',
    },
    expectedStatus: 200,
    adminAuth: true,
  }),
  new IntegrationTest({
    group: 'DomainController',
    name: 'DELETE',
    standardEnvironment: true,
    setup: async function () {
      this.data = await this.apiUtils.createDomain('auto-test-delete');
    },
    url: function () {
      return `/domain/${this.data.id}`;
    },
    method: 'delete',
    expectedStatus: 200,
    adminAuth: true,
  }),
];

describe('Domain controller', function () {
  tests.forEach((test) => {
    test.run();
  });
});
