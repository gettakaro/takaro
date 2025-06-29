import { TakaroEmitter } from './TakaroEmitter.js';
import { expect, sandbox } from '@takaro/test';
import { EventLogLine, GameEvents } from '@takaro/modules';
import { describe, it } from 'vitest';

class ExtendedTakaroEmitter extends TakaroEmitter {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async start() {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async stop() {}

  async foo() {
    throw new Error('testing error');
  }
}

describe('TakaroEmitter', () => {
  it('Can listen for events', async () => {
    const emitter = new ExtendedTakaroEmitter();
    const spy = sandbox.spy();

    emitter.on(GameEvents.LOG_LINE, spy);

    await emitter.emit(
      GameEvents.LOG_LINE,
      new EventLogLine({
        msg: 'test',
      }),
    );

    expect(spy).to.have.callCount(1);

    await emitter.emit(
      GameEvents.LOG_LINE,
      new EventLogLine({
        msg: 'test',
      }),
    );

    expect(spy).to.have.callCount(2);
  });

  it('Can remove a listener, which causes further events to not be received', async () => {
    const emitter = new ExtendedTakaroEmitter();
    const spy = sandbox.spy();

    emitter.on(GameEvents.LOG_LINE, spy);

    await emitter.emit(
      GameEvents.LOG_LINE,
      new EventLogLine({
        msg: 'test',
      }),
    );

    expect(spy).to.have.callCount(1);

    emitter.off(GameEvents.LOG_LINE, spy);

    await emitter.emit(
      GameEvents.LOG_LINE,
      new EventLogLine({
        msg: 'test',
      }),
    );

    expect(spy).to.have.callCount(1);
  });

  it('Errors happening inside extended class do not interrupt flow of events', async () => {
    const emitter = new ExtendedTakaroEmitter();
    const spy = sandbox.spy();
    const errorSpy = sandbox.spy();

    emitter.on(GameEvents.LOG_LINE, spy);
    emitter.on('error', errorSpy);

    await expect(emitter.foo()).to.eventually.be.rejectedWith('testing error');

    expect(errorSpy).to.have.callCount(1);

    await emitter.emit(
      GameEvents.LOG_LINE,
      new EventLogLine({
        msg: 'test',
      }),
    );

    expect(spy).to.have.callCount(1);
  });

  // it('Validates data on emitting', async (t) => {
  //   t.skip();
  //   const emitter = new ExtendedTakaroEmitter();
  //   const spy = sandbox.spy();
  //   const errorSpy = sandbox.spy();

  //   emitter.on(GameEvents.LOG_LINE, spy);
  //   emitter.on('error', errorSpy);

  //   await emitter.emit(
  //     GameEvents.LOG_LINE,
  //     new EventLogLine({
  //       msg: 'test',
  //       // @ts-expect-error testing validation, our types accurately detect this is invalid
  //       unknownProperty: 'this should trip validation',
  //     }),
  //   );

  //   expect(errorSpy).toHaveBeenCalledOnce();
  //   expect(errorSpy.getCall(0).args[0].message).to.match(
  //     /property unknownProperty has failed the following constraints: whitelistValidation/,
  //   );
  // });

  it('Throws when an error occurs and no listeners are attached to the "error" event', async () => {
    const emitter = new ExtendedTakaroEmitter();
    const errorSpy = sandbox.spy();

    await expect(emitter.foo()).to.eventually.be.rejectedWith('Unhandled error in TakaroEmitter');

    emitter.on('error', errorSpy);

    await expect(emitter.foo()).to.eventually.be.rejectedWith('testing error');
    expect(errorSpy).to.have.callCount(1);
  });
});
