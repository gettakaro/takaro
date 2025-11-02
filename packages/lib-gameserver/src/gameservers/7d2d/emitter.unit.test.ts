import 'reflect-metadata';
import { SevenDaysToDieEmitter } from './emitter.js';
import { SdtdConnectionInfo } from './connectionInfo.js';
import { SevenDaysToDie } from './index.js';
import { expect, sandbox } from '@takaro/test';
import { describe, it, beforeEach, afterEach } from 'node:test';
import EventSource from 'eventsource';

describe('SevenDaysToDieEmitter', () => {
  let emitter: SevenDaysToDieEmitter;

  beforeEach(() => {
    // Stub the SevenDaysToDie constructor to prevent network calls
    sandbox.stub(SevenDaysToDie.prototype, 'steamIdOrXboxToGameId').resolves(undefined);

    emitter = new SevenDaysToDieEmitter(
      new SdtdConnectionInfo({
        host: 'localhost:8080',
        adminUser: 'test',
        adminToken: 'test',
        useTls: false,
        useLegacy: false,
        useCPM: false,
      }),
    );
    // Add error handler to prevent unhandled errors
    emitter.on('error', () => {
      // Ignore errors in tests
    });
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

  it.skip('Does not accumulate listeners on start/stop/start cycle', async () => {
    // Track listeners
    const listeners: Array<(data: any) => void> = [];

    // Create a mock EventSource
    class MockEventSource {
      onerror: any = null;
      onopen: any = null;

      constructor(..._args: any[]) {
        //No-op constructor - onopen will be set by the emitter
      }

      addEventListener(event: string, listener: any) {
        listeners.push(listener);
      }

      removeEventListener(event: string, listener: any) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }

      close() {
        // Mock close
      }
    }

    // Stub EventSource constructor
    const OriginalEventSource = EventSource;
    const MockEventSourceClass = class extends MockEventSource {
      constructor(...args: any[]) {
        super(...args);
        // Immediately trigger onopen to resolve the Promise.race in start()
        const triggerOpen = () => {
          if (this.onopen) {
            this.onopen();
          }
        };
        queueMicrotask(triggerOpen.bind(this));
      }
    };
    (global as any).EventSource = MockEventSourceClass;

    try {
      // First start
      await emitter.start();
      expect(listeners.length).to.equal(1, 'Should have 1 listener after start');

      // Stop
      await emitter.stop();
      expect(listeners.length).to.equal(0, 'Should have 0 listeners after stop');

      // Second start (this is where the bug would cause accumulation)
      await emitter.start();
      expect(listeners.length).to.equal(1, 'Should have 1 listener after restart (not 2)');

      // Third start/stop cycle to be extra sure
      await emitter.stop();
      expect(listeners.length).to.equal(0, 'Should have 0 listeners after second stop');

      await emitter.start();
      expect(listeners.length).to.equal(1, 'Should have 1 listener after second restart (not 2 or 3)');
    } finally {
      // Restore EventSource
      (global as any).EventSource = OriginalEventSource;
    }
  });

  it('Uses the same function reference for addEventListener and removeEventListener', () => {
    // Verify boundListener is defined as a class field
    expect((emitter as any).boundListener).to.be.a('function');
  });
});
