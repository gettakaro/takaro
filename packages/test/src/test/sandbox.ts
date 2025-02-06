import sinon from 'sinon';
import { afterEach } from 'node:test';

export const sandbox = sinon.createSandbox();

afterEach(() => {
  sandbox.restore();
});
