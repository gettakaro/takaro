import { expect, sandbox } from '@takaro/test';
import { SevenDaysToDie } from '../index.js';
import { CommandOutput } from '../../../interfaces/GameServer.js';
import { SdtdConnectionInfo } from '../connectionInfo.js';

const testData = {
  oneBan:
    'Ban list entries:\n  Banned until - UserID (name) - Reason\n  2023-06-29 19:39:56 - EOS_00028a9b73bb45b2b74e8f22cda7d225 (-unknown-) - Totally valid testing reason :)\n',
  twoBans:
    'Ban list entries:\n  Banned until - UserID (name) - Reason\n  2028-06-29 17:49:45 - EOS_0002e0daea3b493fa146ce6d06e79a57 (-unknown-) - test\n  2028-06-29 19:19:40 - EOS_00028a9b73bb45b2b74e8f22cda7d225 (-unknown-) - test\n',
  noBans: 'Ban list entries:\n  Banned until - UserID (name) - Reason\n',
  oneBanWithDisplayName:
    'Ban list entries:\n  Banned until - UserID (name) - Reason\n  2023-06-29 19:40:59 - EOS_00028a9b73bb45b2b74e8f22cda7d225 (testing display name) - Totally valid testing reason :)\n',
};

const mockSdtdConnectionInfo = new SdtdConnectionInfo({
  adminToken: 'aaa',
  adminUser: 'aaa',
  useTls: false,
  host: 'localhost',
});

describe('7d2d Actions', () => {
  describe('listBans', () => {
    it('Can parse ban list with a single ban', async () => {
      sandbox.stub(SevenDaysToDie.prototype, 'executeConsoleCommand').resolves(
        new CommandOutput({
          rawResult: testData.oneBan,
          success: true,
        }),
      );

      const result = await new SevenDaysToDie(await mockSdtdConnectionInfo).listBans();

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(1);
      expect(result[0].player.gameId).to.equal('00028a9b73bb45b2b74e8f22cda7d225');
      expect(result[0].player.epicOnlineServicesId).to.equal('00028a9b73bb45b2b74e8f22cda7d225');
      expect(result[0].expiresAt).to.equal('2023-06-29T19:39:56.000Z');
    });

    it('Can parse ban list with two bans', async () => {
      sandbox.stub(SevenDaysToDie.prototype, 'executeConsoleCommand').resolves(
        new CommandOutput({
          rawResult: testData.twoBans,
          success: true,
        }),
      );

      const result = await new SevenDaysToDie(await mockSdtdConnectionInfo).listBans();

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(2);

      expect(result[0].player.gameId).to.equal('0002e0daea3b493fa146ce6d06e79a57');
      expect(result[0].player.epicOnlineServicesId).to.equal('0002e0daea3b493fa146ce6d06e79a57');
      expect(result[0].expiresAt).to.equal('2028-06-29T17:49:45.000Z');

      expect(result[1].player.gameId).to.equal('00028a9b73bb45b2b74e8f22cda7d225');
      expect(result[1].player.epicOnlineServicesId).to.equal('00028a9b73bb45b2b74e8f22cda7d225');
      expect(result[1].expiresAt).to.equal('2028-06-29T19:19:40.000Z');
    });

    it('Can parse ban list with no bans', async () => {
      sandbox.stub(SevenDaysToDie.prototype, 'executeConsoleCommand').resolves(
        new CommandOutput({
          rawResult: testData.noBans,
          success: true,
        }),
      );

      const result = await new SevenDaysToDie(await mockSdtdConnectionInfo).listBans();

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(0);
    });

    it('Can parse ban list with a single ban with a display name', async () => {
      sandbox.stub(SevenDaysToDie.prototype, 'executeConsoleCommand').resolves(
        new CommandOutput({
          rawResult: testData.oneBanWithDisplayName,
          success: true,
        }),
      );

      const result = await new SevenDaysToDie(await mockSdtdConnectionInfo).listBans();

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(1);
      expect(result[0].player.gameId).to.equal('00028a9b73bb45b2b74e8f22cda7d225');
      expect(result[0].player.epicOnlineServicesId).to.equal('00028a9b73bb45b2b74e8f22cda7d225');
      expect(result[0].expiresAt).to.equal('2023-06-29T19:40:59.000Z');
    });
  });
});
