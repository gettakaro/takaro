import { IntegrationTest, expect } from '@takaro/test';
import { PlayerRepo } from '../player.js';
import { PlayerCreateDTO } from '../../service/Player/dto.js';
import { describe } from 'node:test';

const group = 'PlayerNameHistory';

interface SetupData {
  playerRepo: PlayerRepo;
  playerId: string;
  gameServerId: string | null;
}

async function setup(this: IntegrationTest<SetupData>): Promise<SetupData> {
  const domain = await this.adminClient.domain.domainControllerCreate({
    name: 'test-domain',
  });

  const playerRepo = new PlayerRepo(domain.data.data.createdDomain.id);

  // Create a test player
  const player = await playerRepo.create(
    new PlayerCreateDTO({
      name: 'InitialName',
      steamId: '76561198000000001',
    }),
  );

  return {
    playerRepo,
    playerId: player.id,
    gameServerId: null, // Use null for tests since we don't have a real gameserver
  };
}

const tests = [
  new IntegrationTest<SetupData>({
    group,
    snapshot: false,
    name: 'observeName creates new entry for changed name',
    setup,
    test: async function (): Promise<void> {
      const { playerRepo, playerId, gameServerId } = this.setupData;
      const result = await playerRepo.observeName(playerId, gameServerId, 'NewName');

      expect(result).to.exist;
      if (result) {
        expect(result.name).to.equal('NewName');
        expect(result.playerId).to.equal(playerId);
        expect(result.gameServerId).to.equal(gameServerId);
      }
    },
  }),

  new IntegrationTest<SetupData>({
    group,
    snapshot: false,
    name: 'observeName updates player.name column when name changes',
    setup,
    test: async function (): Promise<void> {
      const { playerRepo, playerId, gameServerId } = this.setupData;

      // Get initial player
      const playerBefore = await playerRepo.findOne(playerId);
      const initialName = playerBefore.name;

      // Observe a new name
      await playerRepo.observeName(playerId, gameServerId, 'UpdatedPlayerName');

      // Check that player.name was updated
      const playerAfter = await playerRepo.findOne(playerId);
      expect(playerAfter.name).to.equal('UpdatedPlayerName');
      expect(playerAfter.name).to.not.equal(initialName);
    },
  }),

  new IntegrationTest<SetupData>({
    group,
    snapshot: false,
    name: 'observeName does not create duplicate entries for same name',
    setup,
    test: async function (): Promise<void> {
      const { playerRepo, playerId, gameServerId } = this.setupData;
      await playerRepo.observeName(playerId, gameServerId, 'TestName');
      const result = await playerRepo.observeName(playerId, gameServerId, 'TestName');

      expect(result).to.be.null;
    },
  }),

  new IntegrationTest<SetupData>({
    group,
    snapshot: false,
    name: 'observeName tracks multiple name changes',
    setup,
    test: async function (): Promise<void> {
      const { playerRepo, playerId, gameServerId } = this.setupData;
      await playerRepo.observeName(playerId, gameServerId, 'Name1');
      await playerRepo.observeName(playerId, gameServerId, 'Name2');
      await playerRepo.observeName(playerId, gameServerId, 'Name3');

      const player = await playerRepo.findOne(playerId);
      expect(player.nameHistory).to.have.length(3);
      expect(player.nameHistory[0].name).to.equal('Name3'); // Most recent first
      expect(player.nameHistory[1].name).to.equal('Name2');
      expect(player.nameHistory[2].name).to.equal('Name1');
    },
  }),

  new IntegrationTest<SetupData>({
    group,
    snapshot: false,
    name: 'observeName orders name history by createdAt DESC',
    setup,
    test: async function (): Promise<void> {
      const { playerRepo, playerId, gameServerId } = this.setupData;
      await playerRepo.observeName(playerId, gameServerId, 'OldName');
      await new Promise((resolve) => setTimeout(resolve, 10)); // Small delay
      await playerRepo.observeName(playerId, gameServerId, 'NewerName');
      await new Promise((resolve) => setTimeout(resolve, 10));
      await playerRepo.observeName(playerId, gameServerId, 'NewestName');

      const player = await playerRepo.findOne(playerId);
      expect(player.nameHistory[0].name).to.equal('NewestName');
      expect(player.nameHistory[1].name).to.equal('NewerName');
      expect(player.nameHistory[2].name).to.equal('OldName');
    },
  }),

  new IntegrationTest<SetupData>({
    group,
    snapshot: false,
    name: 'observeName invalidates cache when name changes',
    setup,
    test: async function (): Promise<void> {
      const { playerRepo, playerId, gameServerId } = this.setupData;
      // Set a cached name
      await playerRepo.setCachedName(playerId, 'CachedName');

      // Observe a new name
      await playerRepo.observeName(playerId, gameServerId, 'NewName');

      // Cache should be invalidated
      const cachedName = await playerRepo.getCachedName(playerId);
      expect(cachedName).to.be.null;
    },
  }),

  new IntegrationTest<SetupData>({
    group,
    snapshot: false,
    name: 'Redis cache sets and retrieves cached names',
    setup,
    test: async function (): Promise<void> {
      const { playerRepo, playerId } = this.setupData;
      await playerRepo.setCachedName(playerId, 'TestName');
      const cachedName = await playerRepo.getCachedName(playerId);

      expect(cachedName).to.equal('TestName');
    },
  }),

  new IntegrationTest<SetupData>({
    group,
    snapshot: false,
    name: 'Redis cache returns null when cache miss',
    setup,
    test: async function (): Promise<void> {
      const { playerRepo } = this.setupData;
      const cachedName = await playerRepo.getCachedName('non-existent-id');

      expect(cachedName).to.be.null;
    },
  }),

  new IntegrationTest<SetupData>({
    group,
    snapshot: false,
    name: 'Redis cache handles Redis failures gracefully',
    setup,
    test: async function (): Promise<void> {
      const { playerRepo, playerId } = this.setupData;
      // This should not throw even if Redis is unavailable
      // This should not throw even if Redis is unavailable
      await playerRepo.setCachedName(playerId, 'TestName');
      await playerRepo.getCachedName(playerId);
      await playerRepo.invalidateNameCache(playerId);
      // If we get here, no errors were thrown
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
