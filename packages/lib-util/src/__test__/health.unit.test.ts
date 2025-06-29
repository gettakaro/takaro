import { health } from '../health.js';
import { expect, sandbox } from '@takaro/test';
import { describe, it } from 'vitest';

describe('health', () => {
  it('should be able to register a hook', async () => {
    const hook = sandbox.spy();

    health.registerHook('test', hook);

    await health.check();

    expect(hook).to.have.callCount(1);
  });
});
