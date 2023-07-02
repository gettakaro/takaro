import { expect, sandbox } from '@takaro/test';

import { RustConnectionInfo } from '../connectionInfo.js';
import { CommandOutput } from '../../../interfaces/GameServer.js';
import { Rust } from '../index.js';

const testData = {
  oneBan: '\'1 76561198028175941 "" "no reason" -1\n\'',
  oneBanWithTime: '\'1 76561198028175941 "cata" "naughty" 1688173252\n\'',
  twoBans:
    '1 76561198028175941 "" "stout" 1688173252\n2 76561198035925898 "Emiel" "filthy hacker >:(" -1\n',
  noBans: '',
};

const mockRustConnectionInfo = new RustConnectionInfo().construct({
  host: 'localhost',
  rconPassword: 'aaa',
  rconPort: '28016',
});

describe('rust actions', () => {
  describe('listBans', () => {
    it('Can parse ban list with a single ban', async () => {
      sandbox.stub(Rust.prototype, 'executeConsoleCommand').resolves(
        await new CommandOutput().construct({
          rawResult: testData.oneBan,
          success: true,
        })
      );

      const result = await new Rust(await mockRustConnectionInfo).listBans();

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(1);
      expect(result[0].player.gameId).to.equal('76561198028175941');
      expect(result[0].expiresAt).to.equal(null);
    });

    it('Can parse expiry time', async () => {
      sandbox.stub(Rust.prototype, 'executeConsoleCommand').resolves(
        await new CommandOutput().construct({
          rawResult: testData.oneBanWithTime,
          success: true,
        })
      );

      const result = await new Rust(await mockRustConnectionInfo).listBans();

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(1);
      expect(result[0].player.gameId).to.equal('76561198028175941');
      expect(result[0].expiresAt).to.equal('2023-07-01T01:00:52.000Z');
    });

    it('Can parse ban list with two bans', async () => {
      sandbox.stub(Rust.prototype, 'executeConsoleCommand').resolves(
        await new CommandOutput().construct({
          rawResult: testData.twoBans,
          success: true,
        })
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
        await new CommandOutput().construct({
          rawResult: testData.noBans,
          success: true,
        })
      );

      const result = await new Rust(await mockRustConnectionInfo).listBans();

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(0);
    });
  });
});
