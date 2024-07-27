import { ory } from '../ory.js';
import { faker } from '@faker-js/faker';
import { expect } from '@takaro/test';

describe('Ory', () => {
  it('Create and delete identities', async () => {
    // First, create a bunch of identities
    const totalIdentities = 150;
    const identities = await Promise.all(
      Array.from({ length: totalIdentities }).map(() => ory.createIdentity(faker.internet.email(), 'password')),
    );

    // Fetch the first one by ID

    const firstIdentity = await ory.getIdentity(identities[0].id);
    expect(firstIdentity.email).to.be.eq(identities[0].email);

    // Delete them all
    await Promise.all(identities.map((i) => ory.deleteIdentity(i.id)));

    // Make sure they're gone
    await expect(ory.getIdentity(identities[0].id)).to.eventually.be.rejectedWith(
      'Request failed with status code 404',
    );
  });
});
