import { AdminClient, Client } from '../main.js';
import { expect, integrationConfig } from '@takaro/test';
import { AxiosResponse } from 'axios';
import { DomainCreateOutputDTOAPI } from '../generated/index.js';

const TEST_DOMAIN_NAME = 'apiClient-test';

const TEST_TAKARO_DEV_USER_NAME = 'apiClient-test-user';

describe('API client', () => {
  const adminClient = new AdminClient({
    url: integrationConfig.get('host'),
    auth: {
      clientId: integrationConfig.get('auth.adminClientId'),
      clientSecret: integrationConfig.get('auth.adminClientSecret'),
    },
    OAuth2URL: integrationConfig.get('auth.OAuth2URL'),
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
        filters: { name: TEST_DOMAIN_NAME },
      });

      expect(domainsRes.data.data).to.have.lengthOf(1);
      expect(domainsRes.data.data[0].name).to.equal(TEST_DOMAIN_NAME);

      await adminClient.domain.domainControllerRemove(
        domain.data.data.createdDomain.id
      );
    });
  });

  describe('User controller', () => {
    let domain: AxiosResponse<DomainCreateOutputDTOAPI, unknown> | null = null;

    beforeEach(async () => {
      domain = await adminClient.domain.domainControllerCreate({
        name: TEST_DOMAIN_NAME,
      });
    });

    afterEach(async () => {
      if (domain) {
        await adminClient.domain.domainControllerRemove(
          domain.data.data.createdDomain.id
        );
      }
    });

    it('Can create and delete a user', async () => {
      if (!domain) throw new Error('Domain not created');

      const client = new Client({
        url: integrationConfig.get('host'),
        auth: {
          username: domain.data.data.rootUser.email,
          password: domain.data.data.password,
        },
      });

      await client.login();

      const user = await client.user.userControllerCreate({
        name: TEST_TAKARO_DEV_USER_NAME,
        password: '123456789',
        email: `${TEST_TAKARO_DEV_USER_NAME}@test.takaro.io`,
      });

      expect(user.data.data.name).to.equal(TEST_TAKARO_DEV_USER_NAME);

      const usersRes = await client.user.userControllerSearch({
        filters: { name: TEST_TAKARO_DEV_USER_NAME },
      });

      expect(usersRes.data.data).to.have.lengthOf(1);

      await client.user.userControllerRemove(user.data.data.id);
    });
  });
});
