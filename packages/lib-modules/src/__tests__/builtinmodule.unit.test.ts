import { expect } from '@takaro/test';
import { getModules } from '../main';

describe('BuiltInModule', () => {
  it('Can load module items', async () => {
    const mods = await getModules();

    const pingModule = mods.find((mod) => mod.name === 'ping');

    expect(pingModule).to.not.be.undefined;
    expect(pingModule?.commands).to.have.length(1);
  });
});
