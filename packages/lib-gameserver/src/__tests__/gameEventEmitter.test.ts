import { expect, sandbox } from '@takaro/test';
import { MockConnectionInfo } from '../gameservers/mock/connectionInfo.js';
import { Mock } from '../gameservers/mock/index.js';
import { GameEvents } from '@takaro/modules';

describe('GameEventEmitter', () => {
  /**
   * This test doesn't really do much interesting runtime validation
   * It exists to ensure that the event emitter is safely typed
   * We use @ts-expect-error so that if the compiler fails to mark these as errors, we'll know instantly
   */
  it('Has a typed event emitter', async () => {
    const gameServer = new Mock(new MockConnectionInfo({}));
    const emitter = await gameServer.getEventEmitter();

    const listenerSpy = sandbox.spy();

    emitter.on(GameEvents.PLAYER_CONNECTED, async (e) => {
      expect(() => e.player.name).to.throw(
        // Eslint and prettier disagree on how to format this
        // And I cba fixing it for this specific instance :)
        // eslint-disable-next-line quotes
        "Cannot read properties of undefined (reading 'name')",
      );
    });
    emitter.on(GameEvents.PLAYER_CONNECTED, listenerSpy);

    // @ts-expect-error Should use the enum here
    emitter.on('non-existent-event', listenerSpy);

    // But the raw string will also work in runtime when ignoring the compilation error
    emitter.on('player-connected', listenerSpy);

    expect(listenerSpy).to.have.been.calledTwice;
  });
});
