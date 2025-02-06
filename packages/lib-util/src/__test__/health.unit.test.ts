import { expect, sandbox } from '@takaro/test';
import { health } from '../health.js';
import { describe, it } from 'node:test';

describe('health', () => {
  it('should be able to register a hook', async () => {
    const hook = sandbox.stub();

    health.registerHook('test', hook);

    await health.check();

    expect(hook).to.have.been.calledOnce;
  });
});
