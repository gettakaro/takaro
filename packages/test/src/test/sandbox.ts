import sinon from 'sinon';
import { afterEach } from 'vitest';

export const sandbox = sinon.createSandbox();

afterEach(() => {
  sandbox.restore();
});
