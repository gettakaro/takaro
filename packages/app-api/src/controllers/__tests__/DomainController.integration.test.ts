import { IntegrationTest, integrationConfig, expect } from '@takaro/test';
import { DomainOutputDTOStateEnum, Client } from '@takaro/apiclient';
import { describe } from 'node:test';

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
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Setting domain state to disabled, blocks any following requests',
    test: async function () {
      if (!this.standardDomainId) throw new Error('No domain ID');

      const apiClient = new Client({
        url: integrationConfig.get('host'),
        auth: {
          username: this.standardLogin.username,
          password: this.standardLogin.password,
        },
      });

      await apiClient.login();

      const rolesBefore = await apiClient.role.roleControllerSearch();

      expect(rolesBefore.data.data.length).to.be.greaterThan(0);

      await this.adminClient.domain.domainControllerUpdate(this.standardDomainId, {
        state: DomainOutputDTOStateEnum.Disabled,
      });

      return apiClient.role.roleControllerSearch();
    },
    filteredFields: ['name'],
    expectedStatus: 400,
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
