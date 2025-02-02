import { AdminClient } from '../main.js';
import { expect, integrationConfig } from '@takaro/test';
import { describe } from 'node:test';

const TEST_DOMAIN_NAME = 'apiClient-test';

describe('API client', () => {
  const adminClient = new AdminClient({
    url: integrationConfig.get('host'),
    auth: {
      clientSecret: integrationConfig.get('auth.adminClientSecret'),
    },
  });

  describe('Meta controller', () => {
    it('should get health', async () => {
      const health = await adminClient.meta.metaGetHealth();
      expect(health.data.healthy).to.be.true;
    });
  });

  describe('Domain controller', () => {
    it('Can create and delete a domain', async () => {
      const domain = await adminClient.domain.domainControllerCreate({
        name: TEST_DOMAIN_NAME,
      });
      expect(domain.data.data.createdDomain.name).to.equal(TEST_DOMAIN_NAME);

      const domainsRes = await adminClient.domain.domainControllerSearch({
        filters: { name: [TEST_DOMAIN_NAME] },
      });

      expect(domainsRes.data.data).to.have.lengthOf(1);
      expect(domainsRes.data.data[0].name).to.equal(TEST_DOMAIN_NAME);

      await adminClient.domain.domainControllerRemove(domain.data.data.createdDomain.id);
    });
  });
});
