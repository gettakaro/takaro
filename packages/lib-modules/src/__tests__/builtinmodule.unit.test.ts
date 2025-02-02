import { expect } from '@takaro/test';
import { getModules } from '../main.js';
import { describe, it } from 'node:test';

describe('BuiltInModule', () => {
  it('Can load module items', async () => {
    const mods = await getModules();

    const utilsModule = mods.find((mod) => mod.name === 'utils');

    expect(utilsModule).to.not.be.undefined;
    expect(utilsModule?.versions).to.have.length(1);
    expect(utilsModule?.versions[0].commands).to.have.length(2);
  });
});
