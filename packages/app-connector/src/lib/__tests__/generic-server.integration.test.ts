import { expect, integrationConfig, IntegrationTest } from '@takaro/test';
import { describe } from 'node:test';
import { randomUUID } from 'crypto';
import { AdminClient, Client } from '@takaro/apiclient';

const group = 'GenericServer';

const noopLog = {
  info: () => {},
  error: () => {},
  warn: () => {},
  debug: () => {},
};

const tests = [
  new IntegrationTest({
    group,
    snapshot: false,
    name: 'Can register a new server',
    // setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.domainRegistrationToken) throw new Error('Domain registration token is not set. Invalid setup?');
      const gameServerIdentityToken = randomUUID();

      const mockServer = await this.createMockServer({
        mockserver: { registrationToken: this.domainRegistrationToken, identityToken: gameServerIdentityToken },
      });

      const gameServerRes = (
        await this.client.gameserver.gameServerControllerSearch({
          filters: { identityToken: [gameServerIdentityToken] },
        })
      ).data.data;

      expect(gameServerRes).to.have.lengthOf(1);
      expect(gameServerRes[0].identityToken).to.equal(gameServerIdentityToken);

      await mockServer.shutdown();
    },
  }),
  new IntegrationTest({
    group,
    snapshot: false,
    name: 'Rejects with incorrect registration token',
    // setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.domainRegistrationToken) throw new Error('Domain registration token is not set. Invalid setup?');
      const gameServerIdentityToken = randomUUID();

      try {
        await this.createMockServer({
          mockserver: { registrationToken: 'invalid registration token', identityToken: gameServerIdentityToken },
        });
        throw new Error('Should have thrown an error');
      } catch (error) {
        expect((error as Error).name).to.equal('BadRequestError');
        expect((error as Error).message).to.equal('Invalid registrationToken provided');
      }
    },
  }),
  new IntegrationTest({
    group,
    snapshot: false,
    name: 'Using the same identity token should not create a new server',
    // setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.domainRegistrationToken) throw new Error('Domain registration token is not set. Invalid setup?');
      const gameServerIdentityToken = randomUUID();

      const mockServer1 = await this.createMockServer({
        mockserver: { registrationToken: this.domainRegistrationToken, identityToken: gameServerIdentityToken },
      });

      const mockServer2 = await this.createMockServer({
        mockserver: { registrationToken: this.domainRegistrationToken, identityToken: gameServerIdentityToken },
      });

      const gameServerRes = (
        await this.client.gameserver.gameServerControllerSearch({
          filters: { identityToken: [gameServerIdentityToken] },
        })
      ).data.data;

      expect(gameServerRes).to.have.lengthOf(1);
      expect(gameServerRes[0].identityToken).to.equal(gameServerIdentityToken);

      await mockServer1.shutdown();
      await mockServer2.shutdown();
    },
  }),
  new IntegrationTest({
    group,
    snapshot: false,
    name: 'Passing an empty identity token should throw an error',
    // setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.domainRegistrationToken) throw new Error('Domain registration token is not set. Invalid setup?');

      try {
        await this.createMockServer({
          mockserver: { registrationToken: this.domainRegistrationToken, identityToken: '' },
        });
        throw new Error('Should have thrown an error');
      } catch (error) {
        expect((error as Error).name).to.equal('BadRequestError');
        expect((error as Error).message).to.equal('No identityToken provided');
      }
    },
  }),
  new IntegrationTest<Array<{ id: string; registrationToken: string; client: Client }>>({
    group,
    snapshot: false,
    standardEnvironment: false,
    name: 'Cross-domain server registration',
    setup: async function () {
      // Set up 10 different domains and pass through their registrationTokens and clients.
      const adminClient = new AdminClient({
        url: integrationConfig.get('host'),
        auth: {
          clientSecret: integrationConfig.get('auth.adminClientSecret'),
        },
        log: noopLog,
      });

      const domainsData = Array.from({ length: 10 }, (_) => ({
        name: `integration-${randomUUID()}`,
      }));

      const domains = await Promise.all(
        domainsData.map((domainData) =>
          adminClient.domain.domainControllerCreate({
            name: domainData.name,
          }),
        ),
      );

      const setupData = await Promise.all(
        domains.map(async (domain) => {
          const client = new Client({
            url: integrationConfig.get('host'),
            auth: {
              username: domain.data.data.rootUser.email,
              password: domain.data.data.password,
            },
            log: noopLog,
          });

          await client.login();
          return {
            id: domain.data.data.createdDomain.id,
            registrationToken: domain.data.data.createdDomain.serverRegistrationToken!,
            client,
          };
        }),
      );

      return setupData;
    },
    test: async function () {
      // Create a mock server for each domain using the registration token and identity token.
      // We expect every domain to have ONE server registered.

      await Promise.all(
        this.setupData.map(async (domain) => {
          const gameServerIdentityToken = randomUUID();
          const mockServer = await this.createMockServer({
            mockserver: {
              registrationToken: domain.registrationToken,
              identityToken: gameServerIdentityToken,
            },
          });

          const gameServerRes = (
            await domain.client.gameserver.gameServerControllerSearch({
              filters: { identityToken: [gameServerIdentityToken] },
            })
          ).data.data;
          expect(gameServerRes).to.have.lengthOf(1);
          expect(gameServerRes[0].identityToken).to.equal(gameServerIdentityToken);
          await mockServer.shutdown();
        }),
      );
    },
    teardown: async function () {
      // Remove all the domains that were created in the setup.
      const adminClient = new AdminClient({
        url: integrationConfig.get('host'),
        auth: {
          clientSecret: integrationConfig.get('auth.adminClientSecret'),
        },
        log: noopLog,
      });
      await Promise.all(
        this.setupData.map(async (domain) => {
          await adminClient.domain.domainControllerRemove(domain.id);
        }),
      );
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
