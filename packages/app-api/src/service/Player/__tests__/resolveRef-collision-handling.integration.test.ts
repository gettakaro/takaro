import { IntegrationTest, expect, SetupGameServerPlayers } from '@takaro/test';
import { PlayerService } from '../index.js';
import { IGamePlayer } from '@takaro/modules';
import { describe } from 'node:test';

const group = 'PlayerService: resolveRef collision handling';

const tests = [
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'throws error when platform ID collision detected',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');
      const playerService = new PlayerService(this.standardDomainId);
      const gameServerId = this.setupData.gameServer1.id;

      const sharedPlatformId = 'collision-platform-id-12345';

      // Player A with platformId X
      const gamePlayerA = new IGamePlayer({
        gameId: 'ingame-player-A',
        name: 'PlayerA',
        platformId: sharedPlatformId,
      });

      await playerService.resolveRef(gamePlayerA, gameServerId);

      // Player B with same platformId but different gameId (collision!)
      const gamePlayerB = new IGamePlayer({
        gameId: 'ingame-player-B',
        name: 'PlayerB',
        platformId: sharedPlatformId,
      });

      // Should throw BadRequestError due to collision
      await expect(playerService.resolveRef(gamePlayerB, gameServerId)).to.be.rejectedWith(
        'Platform ID collision detected',
      );
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'throws error when overlapping platform IDs cause collision',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');
      const playerService = new PlayerService(this.standardDomainId);
      const gameServerId = this.setupData.gameServer1.id;

      // Player A with only steamId
      const gamePlayerA = new IGamePlayer({
        gameId: 'game-player-A',
        name: 'PlayerA',
        steamId: '76561198000000001',
      });

      await playerService.resolveRef(gamePlayerA, gameServerId);

      // Player C with same steamId as A but different gameId
      const gamePlayerC = new IGamePlayer({
        gameId: 'game-player-C',
        name: 'PlayerC',
        steamId: '76561198000000001',
        epicOnlineServicesId: '0002b5d970954287afdcb5dc35af0424',
      });

      // Should throw due to steamId collision
      await expect(playerService.resolveRef(gamePlayerC, gameServerId)).to.be.rejectedWith(
        'Platform ID collision detected',
      );
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'preserves valid platform IDs when receiving placeholder updates',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');
      const playerService = new PlayerService(this.standardDomainId);
      const gameServerId = this.setupData.gameServer1.id;

      const validSteamId = '76561198000000001';

      // Create player with valid steamId
      const result1 = await playerService.resolveRef(
        new IGamePlayer({
          gameId: 'player-with-valid-steam',
          name: 'ValidPlayer',
          steamId: validSteamId,
        }),
        gameServerId,
      );

      expect(result1.player.steamId).to.equal(validSteamId);

      // Resolve same player but with placeholder steamId
      const result2 = await playerService.resolveRef(
        new IGamePlayer({
          gameId: 'player-with-valid-steam',
          name: 'ValidPlayer',
          steamId: 'Unknown',
        }),
        gameServerId,
      );

      // Should be same player
      expect(result2.player.id).to.equal(result1.player.id);

      // Valid steamId should NOT be overwritten with placeholder
      expect(result2.player.steamId).to.equal(validSteamId);
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'rejects player with only placeholder platform IDs',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');
      const playerService = new PlayerService(this.standardDomainId);
      const gameServerId = this.setupData.gameServer1.id;

      // Player with only placeholder platformId
      const gamePLayer = new IGamePlayer({
        gameId: 'player-with-placeholder',
        name: 'PlaceholderPlayer',
        platformId: 'Unknown',
      });

      // Should throw validation error - no valid platform IDs after filtering
      await expect(playerService.resolveRef(gamePLayer, gameServerId)).to.be.rejectedWith(
        'At least one platform identifier',
      );
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'allows same player to have different gameIds on different servers',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');
      const playerService = new PlayerService(this.standardDomainId);
      const steamId = '76561198123456789';

      // Same player on server 1
      const result1 = await playerService.resolveRef(
        new IGamePlayer({
          gameId: 'player-server1-id',
          name: 'CrossServerPlayer',
          steamId: steamId,
        }),
        this.setupData.gameServer1.id,
      );

      // Same player on server 2 with different gameId
      const result2 = await playerService.resolveRef(
        new IGamePlayer({
          gameId: 'player-server2-id',
          name: 'CrossServerPlayer',
          steamId: steamId,
        }),
        this.setupData.gameServer2.id,
      );

      // Should be same player profile
      expect(result1.player.id).to.equal(result2.player.id);

      // But different POGs with different gameIds
      expect(result1.pog.id).to.not.equal(result2.pog.id);
      expect(result1.pog.gameId).to.equal('player-server1-id');
      expect(result2.pog.gameId).to.equal('player-server2-id');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
