import { expect, IntegrationTest } from '@takaro/test';
import { describe } from 'node:test';
import { getMockServer } from '@takaro/mock-gameserver';
import { randomUUID } from 'crypto';

const group = 'GenericServer';

const tests = [
  new IntegrationTest({
    group,
    snapshot: false,
    name: 'Can register a new server',
    // setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.domainRegistrationToken) throw new Error('Domain registration token is not set. Invalid setup?');
      const gameServerIdentityToken = randomUUID();

      const mockServer = await getMockServer({
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
        await getMockServer({
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

      const mockServer1 = await getMockServer({
        mockserver: { registrationToken: this.domainRegistrationToken, identityToken: gameServerIdentityToken },
      });

      const mockServer2 = await getMockServer({
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
        await getMockServer({
          mockserver: { registrationToken: this.domainRegistrationToken, identityToken: '' },
        });
        throw new Error('Should have thrown an error');
      } catch (error) {
        expect((error as Error).name).to.equal('BadRequestError');
        expect((error as Error).message).to.equal('No identityToken provided');
      }
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
