import { expect } from 'chai';
import Firecracker from '../';

describe('Firecracker', () => {
  let firecracker: Firecracker;

  before(() => {
    firecracker = new Firecracker({
      binPath: '/home/branco/.local/bin/firecracker',
      socketPath: '/tmp/firecracker.socket',
    });
  });

  it('process should be running', async () => {
    const info = await firecracker.info();

    expect(info.state).to.eq('Not started');
  });

  it('should start a vm', async () => {
    await firecracker.createVM();

    const info = await firecracker.info();

    expect(info.state).to.eq('Running');
  });

  after(() => {
    firecracker.kill();
  });
});
