import { expect } from 'chai';

import { InternalError } from '.';

describe('errors', () => {
  it('Can create an error object', () => {
    const err = new InternalError(new Error('sensitive info'));
    expect(err.toString()).to.equal('InternalError: Internal error');
    expect(err.toString()).to.not.include('sensitive info');
  });
});
