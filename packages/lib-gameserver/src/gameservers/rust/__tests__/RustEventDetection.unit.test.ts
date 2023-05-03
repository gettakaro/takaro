import { expect, sandbox } from '@takaro/test';
import { SinonStub } from 'sinon';
import { RustEmitter, RustEvent, RustEventType } from '../emitter.js';
import { RustConnectionInfo } from '../connectionInfo.js';
import { IGamePlayer } from '../../../interfaces/GamePlayer.js';
import { GameEvents } from '../../../interfaces/events.js';

const MOCK_RUST_PLAYER_CONNECTED: RustEvent = {
  message:
    '169.169.169.80:65384/76561198021481871/brunkel joined [windows/76561198021481871]',
  identifier: 0,
  type: RustEventType.DEFAULT,
  stacktrace: '',
};

const MOCK_PLAYER = new IGamePlayer().construct({
  ip: '169.169.169.80',
  name: 'brunkel',
  gameId: '76561198021481871',
  steamId: '76561198021481871',
  device: 'windows',
});

const MOCK_CONNECTION_INFO = new RustConnectionInfo().construct({
  host: 'localhost',
  rconPassword: 'aaa',
  rconPort: '28016',
});

describe('rust event detection', () => {
  let emitStub: SinonStub;

  beforeEach(() => {
    sandbox.restore();
    emitStub = sandbox.stub(RustEmitter.prototype, 'emit');
  });

  it('[PlayerConnected]: Can detect simple player connected', async () => {
    await new RustEmitter(await MOCK_CONNECTION_INFO).parseMessage(
      MOCK_RUST_PLAYER_CONNECTED
    );

    expect(emitStub).to.have.been.calledTwice;

    expect(emitStub.getCalls()[0].args[0]).to.equal(
      GameEvents.PLAYER_CONNECTED
    );

    expect(emitStub.getCalls()[0].args[1].player).to.deep.equal(
      await MOCK_PLAYER
    );
  });
});
