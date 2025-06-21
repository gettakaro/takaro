import { IntegrationTest, expect, SetupGameServerPlayers } from '@takaro/test';
import { isAxiosError } from '@takaro/apiclient';
import { describe } from 'node:test';
import { randomUUID } from 'node:crypto';

const group = 'EntityController';

const tests = [
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Get entity by ID',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      // First get entities to have an ID to test with
      const entitiesRes = await this.client.entity.entityControllerSearch({
        filters: { gameserverId: [this.setupData.gameServer1.id] },
        sortBy: 'code',
        sortDirection: 'asc',
        limit: 1,
      });

      expect(entitiesRes.data.data).to.have.length(1);
      const entityId = entitiesRes.data.data[0].id;

      const res = await this.client.entity.entityControllerFindOne(entityId);

      // Assert the returned entity has correct properties
      expect(res.data.data.id).to.equal(entityId);
      expect(res.data.data).to.have.property('code');
      expect(res.data.data).to.have.property('name');
      expect(res.data.data.gameserverId).to.equal(this.setupData.gameServer1.id);

      return res;
    },
    filteredFields: ['id', 'createdAt', 'gameserverId', 'updatedAt'],
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Search entities with basic filters - single gameserver',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const res = await this.client.entity.entityControllerSearch({
        filters: { gameserverId: [this.setupData.gameServer1.id] },
        sortBy: 'code',
        sortDirection: 'asc',
      });

      // Expect all entities to be returned for the specified gameserver
      expect(res.data.data).to.have.length(12); // 12 entities in the mock data
      for (const entity of res.data.data) {
        expect(entity.gameserverId).to.equal(this.setupData.gameServer1.id);
        expect(entity).to.have.property('code');
        expect(entity).to.have.property('name');
      }
      return res;
    },
    filteredFields: ['id', 'createdAt', 'gameserverId'],
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Search entities by type filter - hostile only',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const res = await this.client.entity.entityControllerSearch({
        filters: {
          gameserverId: [this.setupData.gameServer1.id],
          type: ['hostile'],
        },
        sortBy: 'code',
        sortDirection: 'asc',
      });

      // Assert exactly 4 hostile entities returned
      expect(res.data.data).to.have.length(4);

      // Assert all returned entities have type = 'hostile'
      for (const entity of res.data.data) {
        expect(entity.type).to.equal('hostile');
        expect(entity.gameserverId).to.equal(this.setupData.gameServer1.id);
      }

      // Assert specific hostile entity codes
      const entityCodes = res.data.data.map((e) => e.code);
      expect(entityCodes).to.deep.equal(['creeper', 'skeleton', 'spider', 'zombie']);

      return res;
    },
    filteredFields: ['id', 'createdAt', 'gameserverId'],
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Search entities by type filter - friendly and neutral',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const res = await this.client.entity.entityControllerSearch({
        filters: {
          gameserverId: [this.setupData.gameServer1.id],
          type: ['friendly', 'neutral'],
        },
        sortBy: 'code',
        sortDirection: 'asc',
      });

      // Assert exactly 8 entities returned (6 friendly + 2 neutral)
      expect(res.data.data).to.have.length(8);

      // Assert all returned entities have correct type
      const friendlyEntities = res.data.data.filter((e) => e.type === 'friendly');
      const neutralEntities = res.data.data.filter((e) => e.type === 'neutral');

      expect(friendlyEntities).to.have.length(6);
      expect(neutralEntities).to.have.length(2);

      // Assert all entities belong to correct gameserver
      for (const entity of res.data.data) {
        expect(entity.type).to.be.oneOf(['friendly', 'neutral']);
        expect(entity.gameserverId).to.equal(this.setupData.gameServer1.id);
      }

      return res;
    },
    filteredFields: ['id', 'createdAt', 'gameserverId'],
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Search entities by name filter',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const res = await this.client.entity.entityControllerSearch({
        filters: {
          gameserverId: [this.setupData.gameServer1.id],
          name: ['Zombie', 'Pig'],
        },
        sortBy: 'code',
        sortDirection: 'asc',
      });

      // Assert exactly 2 entities returned
      expect(res.data.data).to.have.length(2);

      // Assert specific entity names are returned
      const entityNames = res.data.data.map((e) => e.name);
      expect(entityNames).to.deep.equal(['Pig', 'Zombie']); // sorted by code: pig, zombie

      // Assert all entities belong to correct gameserver
      for (const entity of res.data.data) {
        expect(entity.gameserverId).to.equal(this.setupData.gameServer1.id);
      }

      return res;
    },
    filteredFields: ['id', 'createdAt', 'gameserverId'],
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Search entities by code filter',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const res = await this.client.entity.entityControllerSearch({
        filters: {
          gameserverId: [this.setupData.gameServer1.id],
          code: ['zombie', 'cow', 'creeper'],
        },
        sortBy: 'code',
        sortDirection: 'asc',
      });

      // Assert exactly 3 entities returned
      expect(res.data.data).to.have.length(3);

      // Assert specific entity codes are returned in sorted order
      const entityCodes = res.data.data.map((e) => e.code);
      expect(entityCodes).to.deep.equal(['cow', 'creeper', 'zombie']);

      // Assert all entities belong to correct gameserver
      for (const entity of res.data.data) {
        expect(entity.gameserverId).to.equal(this.setupData.gameServer1.id);
      }

      return res;
    },
    filteredFields: ['id', 'createdAt', 'gameserverId'],
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Search entities across multiple gameservers',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const res = await this.client.entity.entityControllerSearch({
        filters: {
          gameserverId: [this.setupData.gameServer1.id, this.setupData.gameServer2.id],
        },
        sortBy: 'code',
        sortDirection: 'asc',
      });

      // Assert exactly 24 entities returned (12 from each gameserver)
      expect(res.data.data).to.have.length(24);

      // Assert all entities belong to one of the specified gameservers
      const validGameserverIds = [this.setupData.gameServer1.id, this.setupData.gameServer2.id];
      for (const entity of res.data.data) {
        expect(validGameserverIds).to.include(entity.gameserverId);
      }

      // Assert we have entities from both gameservers
      const gameserver1Entities = res.data.data.filter((e) => e.gameserverId === this.setupData.gameServer1.id);
      const gameserver2Entities = res.data.data.filter((e) => e.gameserverId === this.setupData.gameServer2.id);
      expect(gameserver1Entities).to.have.length(12);
      expect(gameserver2Entities).to.have.length(12);

      return res;
    },
    filteredFields: ['id', 'createdAt', 'gameserverId'],
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Search entities with combined filters',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const res = await this.client.entity.entityControllerSearch({
        filters: {
          gameserverId: [this.setupData.gameServer1.id],
          type: ['hostile'],
          name: ['Zombie', 'Skeleton'],
        },
        sortBy: 'code',
        sortDirection: 'asc',
      });

      // Assert exactly 2 entities returned (skeleton and zombie are both hostile)
      expect(res.data.data).to.have.length(2);

      // Assert all returned entities are hostile type
      for (const entity of res.data.data) {
        expect(entity.type).to.equal('hostile');
        expect(entity.gameserverId).to.equal(this.setupData.gameServer1.id);
      }

      // Assert specific entity names and codes
      const entityNames = res.data.data.map((e) => e.name);
      const entityCodes = res.data.data.map((e) => e.code);
      expect(entityNames).to.deep.equal(['Skeleton', 'Zombie']); // sorted by code
      expect(entityCodes).to.deep.equal(['skeleton', 'zombie']);

      return res;
    },
    filteredFields: ['id', 'createdAt', 'gameserverId'],
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Search entities by description search functionality',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const res = await this.client.entity.entityControllerSearch({
        filters: { gameserverId: [this.setupData.gameServer1.id] },
        search: {
          description: ['undead'], // Should match zombie and skeleton
        },
        sortBy: 'code',
        sortDirection: 'asc',
      });

      // Assert exactly 2 entities returned (skeleton and zombie have "undead" in description)
      expect(res.data.data).to.have.length(2);

      // Assert all returned entities contain "undead" in their description
      for (const entity of res.data.data) {
        expect(entity.description?.toLowerCase()).to.include('undead');
        expect(entity.gameserverId).to.equal(this.setupData.gameServer1.id);
      }

      // Assert specific entity codes are returned
      const entityCodes = res.data.data.map((e) => e.code);
      expect(entityCodes).to.deep.equal(['skeleton', 'zombie']);

      return res;
    },
    filteredFields: ['id', 'createdAt', 'gameserverId'],
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Search entities with pagination',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const res = await this.client.entity.entityControllerSearch({
        filters: { gameserverId: [this.setupData.gameServer1.id] },
        sortBy: 'code',
        sortDirection: 'asc',
        limit: 5,
        page: 0,
      });

      // Assert exactly 5 entities returned (limit applied)
      expect(res.data.data).to.have.length(5);

      // Assert pagination metadata
      expect(res.data.meta.total).to.equal(12); // total entities available
      expect(res.data.meta.page).to.equal(0);
      expect(res.data.meta.limit).to.equal(5);

      // Assert first 5 entities by code (alphabetical order)
      const entityCodes = res.data.data.map((e) => e.code);
      expect(entityCodes).to.deep.equal(['chicken', 'cow', 'creeper', 'enderman', 'horse']);

      // Assert all entities belong to correct gameserver
      for (const entity of res.data.data) {
        expect(entity.gameserverId).to.equal(this.setupData.gameServer1.id);
      }

      return res;
    },
    filteredFields: ['id', 'createdAt', 'gameserverId'],
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Verify all mock entities are synced correctly',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const entitiesRes = await this.client.entity.entityControllerSearch({
        filters: { gameserverId: [this.setupData.gameServer1.id] },
        sortBy: 'code',
        sortDirection: 'asc',
      });

      // Verify we have exactly 12 entities from the mock server
      expect(entitiesRes.data.data).to.have.length(12);

      // Verify specific entities exist
      const entityCodes = entitiesRes.data.data.map((e) => e.code);
      const expectedCodes = [
        'chicken',
        'cow',
        'creeper',
        'enderman',
        'horse',
        'pig',
        'sheep',
        'skeleton',
        'spider',
        'villager',
        'wolf',
        'zombie',
      ];

      expect(entityCodes).to.deep.equal(expectedCodes);

      return entitiesRes;
    },
    filteredFields: ['id', 'createdAt', 'gameserverId'],
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Verify entities with metadata are handled correctly',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const entitiesRes = await this.client.entity.entityControllerSearch({
        filters: {
          gameserverId: [this.setupData.gameServer1.id],
          code: ['villager', 'creeper', 'horse'],
        },
        sortBy: 'code',
        sortDirection: 'asc',
      });

      // Verify entities with metadata
      expect(entitiesRes.data.data).to.have.length(3);

      // Check that metadata exists for these entities
      entitiesRes.data.data.forEach((entity) => {
        expect(entity.metadata).to.not.be.null;
        expect(entity.metadata).to.be.an('object');
      });

      return entitiesRes;
    },
    filteredFields: ['id', 'createdAt', 'gameserverId'],
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Verify entity types coverage',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const allEntitiesRes = await this.client.entity.entityControllerSearch({
        filters: { gameserverId: [this.setupData.gameServer1.id] },
      });

      const entities = allEntitiesRes.data.data;

      // Count entities by type
      const hostileCount = entities.filter((e) => e.type === 'hostile').length;
      const friendlyCount = entities.filter((e) => e.type === 'friendly').length;
      const neutralCount = entities.filter((e) => e.type === 'neutral').length;

      // Verify expected counts based on mock data
      expect(hostileCount).to.equal(4); // zombie, skeleton, spider, creeper
      expect(friendlyCount).to.equal(6); // cow, pig, sheep, chicken, villager, horse
      expect(neutralCount).to.equal(2); // wolf, enderman
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Error handling - invalid entity ID',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      try {
        await this.client.entity.entityControllerFindOne(randomUUID());
        throw new Error('Expected 404 error but request succeeded');
      } catch (error) {
        if (isAxiosError(error)) {
          expect(error.response?.status).to.equal(404);
          expect(error.response?.data.meta.error.message).to.include('Not found');
          return;
        }
        throw error;
      }
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Empty results with non-matching filters',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const res = await this.client.entity.entityControllerSearch({
        filters: {
          gameserverId: [this.setupData.gameServer1.id],
          code: ['nonexistent-entity'],
        },
      });

      // Assert no entities returned
      expect(res.data.data).to.have.length(0);

      // Assert pagination metadata for empty results
      expect(res.data.meta.total).to.equal(0);

      return res;
    },
    filteredFields: ['id', 'createdAt', 'gameserverId'],
  }),
];

describe(group, () => {
  tests.forEach((test) => {
    test.run();
  });
});
