import { IntegrationTest } from '@takaro/test';

const group = 'DomainController';

const tests = [
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Get by ID',
    test: async function () {
      if (!this.standardDomainId) throw new Error('No domain ID');
      return this.adminClient.domain.domainControllerGetOne(this.standardDomainId);
    },
    filteredFields: ['name'],
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Get by ID with invalid ID',
    test: async function () {
      return this.adminClient.domain.domainControllerGetOne('invalid-id');
    },
    expectedStatus: 404,
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Update by ID',
    test: async function () {
      if (!this.standardDomainId) throw new Error('No domain ID');
      return this.adminClient.domain.domainControllerUpdate(this.standardDomainId, {
        name: 'New name',
      });
    },
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Update by ID with invalid ID',
    test: async function () {
      return this.adminClient.domain.domainControllerUpdate('invalid-id', {
        name: 'New name',
      });
    },
    expectedStatus: 404,
  }),

  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Delete',
    test: async function () {
      if (!this.standardDomainId) throw new Error('No domain ID');
      return this.adminClient.domain.domainControllerRemove(this.standardDomainId);
    },
  }),

  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Delete with invalid ID',
    test: async function () {
      return this.adminClient.domain.domainControllerRemove('invalid-id');
    },
    expectedStatus: 404,
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
