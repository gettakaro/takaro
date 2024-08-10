import { expect, sandbox } from '@takaro/test';

import { RustConnectionInfo } from '../connectionInfo.js';
import { CommandOutput } from '../../../interfaces/GameServer.js';
import { Rust } from '../index.js';
import { IGamePlayer } from '@takaro/modules';

const MOCK_PLAYER = new IGamePlayer({
  ip: '169.169.169.80',
  name: 'brunkel',
  gameId: '76561198021481871',
  steamId: '76561198021481871',
});

const testData = {
  oneBan: '\'1 76561198028175941 "" "no reason" -1\n\'',
  oneBanWithTime: '\'1 76561198028175941 "cata" "naughty" 1688173252\n\'',
  twoBans: '1 76561198028175941 "" "stout" 1688173252\n2 76561198035925898 "Emiel" "filthy hacker >:(" -1\n',
  noBans: '',
};

const mockRustConnectionInfo = new RustConnectionInfo({
  host: 'localhost',
  rconPassword: 'aaa',
  rconPort: '28016',
});

describe('rust actions', () => {
  describe('listBans', () => {
    it('Can parse ban list with a single ban', async () => {
      sandbox.stub(Rust.prototype, 'executeConsoleCommand').resolves(
        new CommandOutput({
          rawResult: testData.oneBan,
          success: true,
        }),
      );

      const result = await new Rust(await mockRustConnectionInfo).listBans();

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(1);
      expect(result[0].player.gameId).to.equal('76561198028175941');
      expect(result[0].expiresAt).to.equal(null);
    });

    it('Can parse expiry time', async () => {
      sandbox.stub(Rust.prototype, 'executeConsoleCommand').resolves(
        new CommandOutput({
          rawResult: testData.oneBanWithTime,
          success: true,
        }),
      );

      const result = await new Rust(await mockRustConnectionInfo).listBans();

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(1);
      expect(result[0].player.gameId).to.equal('76561198028175941');
      expect(result[0].expiresAt).to.equal('2023-07-01T01:00:52.000Z');
    });

    it('Can parse ban list with two bans', async () => {
      sandbox.stub(Rust.prototype, 'executeConsoleCommand').resolves(
        new CommandOutput({
          rawResult: testData.twoBans,
          success: true,
        }),
      );

      const result = await new Rust(await mockRustConnectionInfo).listBans();

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(2);

      expect(result[0].player.gameId).to.equal('76561198028175941');
      expect(result[0].expiresAt).to.equal('2023-07-01T01:00:52.000Z');

      expect(result[1].player.gameId).to.equal('76561198035925898');
      expect(result[1].expiresAt).to.equal(null);
    });

    it('Can parse ban list with no bans', async () => {
      sandbox.stub(Rust.prototype, 'executeConsoleCommand').resolves(
        new CommandOutput({
          rawResult: testData.noBans,
          success: true,
        }),
      );

      const result = await new Rust(await mockRustConnectionInfo).listBans();

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(0);
    });
  });

  describe('[getPlayerLocation]', () => {
    it('Works for a single player', async () => {
      const res = new CommandOutput({
        rawResult: `SteamID           DisplayName POS                    ROT               \n${
          (await MOCK_PLAYER).gameId
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
        z: -1090,
      });
    });

    it('When output has multiple players', async () => {
      const res = new CommandOutput({
        rawResult: `SteamID           DisplayName POS                    ROT               \nfake_steam_id Catalysm    (-123.0, 1.0, -1090.7) (1.0, -0.1, -0.1) \n${
          (await MOCK_PLAYER).gameId
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
        z: -1100,
      });
    });
  });
});
