import { errors } from '@takaro/shared';
import { expect } from '@takaro/test';

import { signJwt } from './sign';
import { verifyJwt } from './verify';

describe('jwt', function () {
  it('Can sign and verify data', async () => {
    const jwt = await signJwt({ some: 'data' });
    const decoded = await verifyJwt(jwt);
    expect(decoded['some']).to.equal('data');
    expect(decoded.iat).to.be.a('number');
  });

  it('throws when an invalid JWT is provided', async () => {
    await expect(verifyJwt('this is not a JWT')).to.be.rejectedWith(
      errors.NotAuthorized
    );
  });

  it('throws when an invalidly signed JWT is provided', async () => {
    // This is a valid JWT, but it's signed with a different secret
    await expect(
      verifyJwt(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzb21lIjoiZGF0YSIsImlhdCI6MTYzOTc3NDA0MX0.PtxDK5DTbkFFFoyUpL-n3Y3HnSWjAbuwGquG-PKVgoU'
      )
    ).to.be.rejectedWith(errors.NotAuthorized);
  });

  it('throws when an expired JWT is provided', async () => {
    const expiredJwt = await signJwt({
      foo: 'bar',
      exp: Math.floor(Date.now() / 1000) - 30,
    });
    await expect(verifyJwt(expiredJwt)).to.be.rejectedWith(
      errors.NotAuthorized
    );
  });
});
