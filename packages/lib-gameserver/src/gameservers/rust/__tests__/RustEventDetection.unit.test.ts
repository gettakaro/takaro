import { expect, sandbox } from '@takaro/test';
import { SinonStub } from 'sinon';
import { RustEmitter, RustEvent, RustEventType } from '../emitter.js';
import { RustConnectionInfo } from '../connectionInfo.js';
import { IGamePlayer } from '../../../interfaces/GamePlayer.js';
import { GameEvents } from '../../../interfaces/events.js';
import { CommandOutput } from '../../../interfaces/GameServer.js';
import { Rust } from '../index.js';

const MOCK_RUST_PLAYER_CONNECTED: RustEvent = {
  Message:
    '169.169.169.80:65384/76561198021481871/brunkel joined [windows/76561198021481871]',
  Identifier: 0,
  Type: RustEventType.DEFAULT,
  Stacktrace: '',
};

const MOCK_PLAYER = new IGamePlayer().construct({
  ip: '169.169.169.80',
  name: 'brunkel',
  gameId: '76561198021481871',
  steamId: '76561198021481871',
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

  describe('[getPlayerLocation]', () => {
    it('Works for a single player', async () => {
      const res = await new CommandOutput().construct({
        rawResult: `SteamID           DisplayName POS                    ROT               \n${
          (
            await MOCK_PLAYER
          ).gameId
        } Catalysm    (-770.0, 1.0, -1090.7) (1.0, -0.1, -0.1) \n`,
        success: undefined,
        errorMessage: undefined,
      });

      const rustInstance = new Rust({} as RustConnectionInfo);
      sandbox.stub(rustInstance, 'executeConsoleCommand').resolves(res);

      const location = await rustInstance.getPlayerLocation(await MOCK_PLAYER);

      expect(location).to.deep.equal({
        x: -770.0,
        y: 1.0,
        z: -1090.7,
      });
    });

    it('When output has multiple players', async () => {
      const res = await new CommandOutput().construct({
        rawResult: `SteamID           DisplayName POS                    ROT               \nfake_steam_id Catalysm    (-123.0, 1.0, -1090.7) (1.0, -0.1, -0.1) \n${
          (
            await MOCK_PLAYER
          ).gameId
        } Player2    (-780.0, 2.0, -1100.7) (1.1, -0.2, -0.2) \n76561198028175943 Player3    (-790.0, 3.0, -1110.7) (1.2, -0.3, -0.3) \n`,
        success: undefined,
        errorMessage: undefined,
      });

      const rustInstance = new Rust({} as RustConnectionInfo);
      sandbox.stub(rustInstance, 'executeConsoleCommand').resolves(res);

      const location = await rustInstance.getPlayerLocation(await MOCK_PLAYER);

      expect(location).to.deep.equal({
        x: -780.0,
        y: 2.0,
        z: -1100.7,
      });
    });
  });
});
