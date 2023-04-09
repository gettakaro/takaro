import { expect } from '@takaro/test';
import { getModules } from '../main';

describe('BuiltInModule', () => {
  it('Can load module items', async () => {
    const mods = await getModules();

    const utilsModule = mods.find((mod) => mod.name === 'utils');

    expect(utilsModule).to.not.be.undefined;
    expect(utilsModule?.commands).to.have.length(2);
  });
});
