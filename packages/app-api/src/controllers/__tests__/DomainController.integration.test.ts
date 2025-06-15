import { IntegrationTest, integrationConfig, expect } from '@takaro/test';
import { DomainOutputDTOStateEnum, Client } from '@takaro/apiclient';
import { describe } from 'node:test';
import { randomUUID } from 'crypto';

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
    filteredFields: ['name', 'serverRegistrationToken'],
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
    filteredFields: ['serverRegistrationToken'],
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
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Resolve registration token - valid token',
    test: async function () {
      if (!this.domainRegistrationToken) throw new Error('No domain registration token');
      return this.adminClient.domain.domainControllerResolveRegistrationToken({
        registrationToken: this.domainRegistrationToken,
      });
    },
    filteredFields: ['name', 'serverRegistrationToken', 'externalReference'],
  }),

  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Resolve registration token - invalid token',
    test: async function () {
      return this.adminClient.domain.domainControllerResolveRegistrationToken({
        registrationToken: 'invalid-token-that-does-not-exist',
      });
    },
    expectedStatus: 404,
  }),

  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Resolve registration token - empty token',
    test: async function () {
      return this.adminClient.domain.domainControllerResolveRegistrationToken({
        registrationToken: '',
      });
    },
    expectedStatus: 404,
  }),

  new IntegrationTest<{ domainId: string; registrationToken: string }>({
    group,
    snapshot: true,
    name: 'Resolve registration token - deleted domain token returns 404',
    setup: async function () {
      // Create a temporary domain to get its registration token
      const tempDomainData = await this.adminClient.domain.domainControllerCreate({
        name: `temp-domain-${randomUUID().slice(0, 8)}`,
        maxGameservers: 1,
        maxUsers: 10,
        eventRetentionDays: 7,
        maxVariables: 10,
        maxModules: 5,
        maxFunctionsInModule: 10,
      });

      const domainId = tempDomainData.data.data.createdDomain.id;
      const registrationToken = tempDomainData.data.data.createdDomain.serverRegistrationToken!;

      // Delete the domain
      await this.adminClient.domain.domainControllerRemove(domainId);

      return { domainId, registrationToken };
    },
    test: async function () {
      // Try to resolve the token from the deleted domain
      return this.adminClient.domain.domainControllerResolveRegistrationToken({
        registrationToken: this.setupData.registrationToken,
      });
    },
    expectedStatus: 404,
  }),

  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Resolve registration token - malformed token format',
    test: async function () {
      return this.adminClient.domain.domainControllerResolveRegistrationToken({
        registrationToken: 'clearly-not-a-valid-base64-token-format!!!',
      });
    },
    expectedStatus: 404,
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
