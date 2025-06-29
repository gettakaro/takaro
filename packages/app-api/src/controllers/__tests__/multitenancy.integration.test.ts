import { IntegrationTest, expect } from '@takaro/test';
import { DomainCreateOutputDTOAPI } from '@takaro/apiclient';
import { PERMISSIONS } from '@takaro/auth';
import { describe } from 'vitest';

const group = 'Multitenancy';

const tests = [
  new IntegrationTest<DomainCreateOutputDTOAPI>({
    group,
    snapshot: true,
    name: 'Cannot read data from other domains',
    setup: async function () {
      const permissions = await this.client.permissionCodesToInputs([PERMISSIONS.READ_ROLES]);

      // Create a role in standard domain
      await this.client.role.roleControllerCreate({
        name: 'Test role',
        permissions,
      });

      // Create a new domain and login to that
      const newDomain = await this.adminClient.domain.domainControllerCreate({
        name: 'new domain',
      });
      this.client.username = newDomain.data.data.rootUser.email;
      this.client.password = newDomain.data.data.password;
      await this.client.login();

      return newDomain.data;
    },
    test: async function () {
      const res = await this.client.role.roleControllerSearch({
        filters: { name: ['Test role'] },
      });

      expect(res.data.data).to.have.length(0);

      // Login to standard env again
      this.client.username = this.standardLogin.username;
      this.client.password = this.standardLogin.password;
      await this.client.login();

      const res2 = await this.client.role.roleControllerSearch({
        filters: { name: ['Test role'] },
      });

      expect(res2.data.data).to.have.length(1);

      return res;
    },
    teardown: async function () {
      if (!this.standardDomainId) throw new Error('No domain ID');
      await this.adminClient.domain.domainControllerRemove(this.setupData.data.createdDomain.id);
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
