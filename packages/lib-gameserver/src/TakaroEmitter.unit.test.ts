import { TakaroEmitter } from './TakaroEmitter.js';
import { expect, sandbox } from '@takaro/test';
import { EventLogLine, GameEvents } from '@takaro/modules';
import { describe, it } from 'node:test';

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

    expect(spy).to.have.been.calledOnce;

    await emitter.emit(
      GameEvents.LOG_LINE,
      new EventLogLine({
        msg: 'test',
      }),
    );

    expect(spy).to.have.been.calledTwice;
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

    expect(spy).to.have.been.calledOnce;

    emitter.off(GameEvents.LOG_LINE, spy);

    await emitter.emit(
      GameEvents.LOG_LINE,
      new EventLogLine({
        msg: 'test',
      }),
    );

    expect(spy).to.have.been.calledOnce;
  });

  it('Can have multiple listeners for the same event', async () => {
    const emitter = new ExtendedTakaroEmitter();
    const spy1 = sandbox.spy();
    const spy2 = sandbox.spy();
    const spy3 = sandbox.spy();

    emitter.on(GameEvents.LOG_LINE, spy1);
    emitter.on(GameEvents.LOG_LINE, spy2);
    emitter.on(GameEvents.LOG_LINE, spy3);

    await emitter.emit(
      GameEvents.LOG_LINE,
      new EventLogLine({
        msg: 'test',
      }),
    );

    expect(spy1).to.have.been.calledOnce;
    expect(spy2).to.have.been.calledOnce;
    expect(spy3).to.have.been.calledOnce;
  });

  it('Can remove one listener without affecting others', async () => {
    const emitter = new ExtendedTakaroEmitter();
    const spy1 = sandbox.spy();
    const spy2 = sandbox.spy();

    emitter.on(GameEvents.LOG_LINE, spy1);
    emitter.on(GameEvents.LOG_LINE, spy2);

    await emitter.emit(
      GameEvents.LOG_LINE,
      new EventLogLine({
        msg: 'test',
      }),
    );

    expect(spy1).to.have.been.calledOnce;
    expect(spy2).to.have.been.calledOnce;

    emitter.off(GameEvents.LOG_LINE, spy1);

    await emitter.emit(
      GameEvents.LOG_LINE,
      new EventLogLine({
        msg: 'test',
      }),
    );

    expect(spy1).to.have.been.calledOnce;
    expect(spy2).to.have.been.calledTwice;
  });

  it('Errors happening inside extended class do not interrupt flow of events', async () => {
    const emitter = new ExtendedTakaroEmitter();
    const spy = sandbox.spy();
    const errorSpy = sandbox.spy();

    emitter.on(GameEvents.LOG_LINE, spy);
    emitter.on('error', errorSpy);

    await expect(emitter.foo()).to.eventually.be.rejectedWith('testing error');

    expect(errorSpy).to.have.been.calledOnce;

    await emitter.emit(
      GameEvents.LOG_LINE,
      new EventLogLine({
        msg: 'test',
      }),
    );

    expect(spy).to.have.been.calledOnce;
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

  //   expect(errorSpy).to.have.been.calledOnce;
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
    expect(errorSpy).to.have.been.calledOnce;
  });
});
