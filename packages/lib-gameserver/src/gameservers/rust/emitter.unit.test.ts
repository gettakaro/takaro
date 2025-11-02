import 'reflect-metadata';
import { RustEmitter } from './emitter.js';
import { RustConnectionInfo } from './connectionInfo.js';
import { expect, sandbox } from '@takaro/test';
import { describe, it, beforeEach, afterEach } from 'node:test';
import WebSocket from 'ws';

describe('RustEmitter', () => {
  let emitter: RustEmitter;

  beforeEach(() => {
    emitter = new RustEmitter(
      new RustConnectionInfo({
        host: 'localhost',
        rconPort: '28016',
        rconPassword: 'test',
        useTls: false,
      }),
    );
  });

  afterEach(async () => {
    if (emitter) {
      try {
        await emitter.stop();
      } catch {
        // Ignore errors during cleanup
      }
    }
    sandbox.restore();
  });

  it('Does not accumulate listeners on start/stop/start cycle', async () => {
    // Mock WebSocket to prevent actual network calls
    const mockWs = {
      on: sandbox.spy(),
      off: sandbox.spy(),
      close: sandbox.spy(),
      readyState: WebSocket.OPEN,
    };

    // Stub getClient to return mock WebSocket
    sandbox.stub(RustEmitter, 'getClient').resolves(mockWs as any);

    // First start
    await emitter.start();

    // Verify listener was added once
    expect(mockWs.on).to.have.been.calledOnce;
    expect(mockWs.on).to.have.been.calledWith('message');

    const firstAddedListener = mockWs.on.getCall(0).args[1];

    // Stop
    await emitter.stop();

    // Verify listener was removed
    expect(mockWs.off).to.have.been.calledOnce;
    expect(mockWs.off).to.have.been.calledWith('message');

    const removedListener = mockWs.off.getCall(0).args[1];

    // Verify the same function reference was used for on and off
    expect(firstAddedListener).to.equal(
      removedListener,
      'on() and off() must use the same function reference to properly remove the listener',
    );

    expect(mockWs.close).to.have.been.calledOnce;

    // Reset the mock for second start
    mockWs.on.resetHistory();
    mockWs.off.resetHistory();

    // Second start
    await emitter.start();

    // Verify listener was added again
    expect(mockWs.on).to.have.been.calledOnce;
    expect(mockWs.on).to.have.been.calledWith('message');

    const secondAddedListener = mockWs.on.getCall(0).args[1];

    // Verify the same listener reference is reused
    expect(firstAddedListener).to.equal(
      secondAddedListener,
      'The same listener reference must be reused across restarts to prevent accumulation',
    );
  });

  it('Uses the same function reference for on and off', () => {
    // Verify boundListener is defined as a class field
    expect((emitter as any).boundListener).to.be.a('function');
  });
});
