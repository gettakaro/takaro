import { IntegrationTest, expect, SetupGameServerPlayers } from '@takaro/test';
import { isAxiosError, PlayerOnGameserverOutputDTO, ItemsOutputDTO } from '@takaro/apiclient';
import { describe } from 'vitest';
import { TrackingRepo } from '../../db/tracking.js';

const group = 'TrackingController';

interface TrackingDataPoint {
  playerId: string;
  x: number;
  y: number;
  z: number;
  timestamp: Date;
}

interface InventoryDataPoint {
  playerId: string;
  itemId: string;
  quantity: number;
  timestamp: Date;
}

/**
 * Sets up a well-defined set of historical player movement data for testing.
 * @param domainId
 * @param pogs
 * @returns
 */
async function setupHistoricalData(domainId: string, pogs: PlayerOnGameserverOutputDTO[]) {
  const repo = new TrackingRepo(domainId);

  const trackingData: TrackingDataPoint[] = [];

  // Base timestamp
  const baseTime = new Date('2024-01-01T00:00:00Z');

  // Generate data for each player
  pogs.forEach((pog, pogIndex) => {
    // Each player gets different movement patterns
    switch (pogIndex) {
      case 0:
        // Player 0: Stationary in corner (for bounding box testing)
        for (let hour = 0; hour < 24; hour++) {
          trackingData.push({
            playerId: pog.id,
            x: 100,
            y: 50,
            z: 100,
            timestamp: new Date(baseTime.getTime() + hour * 3600000),
          });
        }
        break;

      case 1:
        // Player 1: Moving in a line (for radius testing)
        for (let hour = 0; hour < 24; hour++) {
          trackingData.push({
            playerId: pog.id,
            x: 200 + hour * 10,
            y: 100,
            z: 200,
            timestamp: new Date(baseTime.getTime() + hour * 3600000),
          });
        }
        break;

      case 2:
        // Player 2: Circular movement around center point (500, 100, 500)
        for (let hour = 0; hour < 24; hour++) {
          const angle = (hour / 24) * 2 * Math.PI;
          trackingData.push({
            playerId: pog.id,
            x: 500 + Math.cos(angle) * 100,
            y: 100,
            z: 500 + Math.sin(angle) * 100,
            timestamp: new Date(baseTime.getTime() + hour * 3600000),
          });
        }
        break;

      case 3:
        // Player 3: Random movement within bounds
        for (let hour = 0; hour < 24; hour++) {
          trackingData.push({
            playerId: pog.id,
            x: 300 + Math.random() * 200,
            y: 50 + Math.random() * 100,
            z: 300 + Math.random() * 200,
            timestamp: new Date(baseTime.getTime() + hour * 3600000),
          });
        }
        break;
    }
  });

  // Add some data points at specific timestamps for precise testing
  if (pogs.length > 0) {
    // Data for bounding box test (should find players in box 0-200, 0-100, 0-200)
    trackingData.push({
      playerId: pogs[0].id,
      x: 150,
      y: 75,
      z: 150,
      timestamp: new Date('2024-01-15T12:00:00Z'),
    });
  }

  if (pogs.length > 1) {
    // Data for radius test (should find players within 50 units of (500, 100, 500))
    trackingData.push({
      playerId: pogs[1].id,
      x: 520,
      y: 100,
      z: 480,
      timestamp: new Date('2024-01-15T12:00:00Z'),
    });
  }

  // Insert all tracking data
  const insertData = trackingData.map((point) => ({
    playerId: point.playerId,
    x: point.x,
    y: point.y,
    z: point.z,
    createdAt: point.timestamp.toISOString(),
    domain: domainId,
  }));

  // Ensure there are partitions for all required dates
  for (let day = 0; day < 30; day++) {
    const partitionDate = new Date(baseTime.getTime() + day * 86400000);
    await repo.ensureLocationPartition(partitionDate.toISOString());
  }

  if (insertData.length > 0) {
    const knex = await repo.getKnex();
    await knex.batchInsert('playerLocation', insertData, 1000);
  }

  return {
    totalRecords: insertData.length,
    dateRange: {
      start: baseTime.toISOString(),
      end: new Date(baseTime.getTime() + 29 * 86400000).toISOString(),
    },
    testPoints: {
      boundingBoxTest: {
        box: { minX: 0, maxX: 200, minY: 0, maxY: 100, minZ: 0, maxZ: 200 },
        timestamp: '2024-01-15T12:00:00Z',
        expectedPlayers: pogs.length > 0 ? [pogs[0].id] : [],
      },
      radiusTest: {
        center: { x: 500, y: 100, z: 500 },
        radius: 50,
        timestamp: '2024-01-15T12:00:00Z',
        expectedPlayers: pogs.length > 1 ? [pogs[1].id] : [],
      },
    },
  };
}

/**
 * Sets up historical inventory data for testing using items from the game server.
 * @param domainId
 * @param pogs
 * @param gameServerId
 * @param client
 * @returns
 */
async function setupInventoryData(
  domainId: string,
  pogs: PlayerOnGameserverOutputDTO[],
  gameServerId: string,
  client: any,
) {
  const repo = new TrackingRepo(domainId);

  // Get available items from the game server
  const itemsRes = await client.item.itemControllerSearch({
    sortBy: 'name',
    filters: { gameserverId: [gameServerId] },
  });
  const items: ItemsOutputDTO[] = itemsRes.data.data;

  if (items.length === 0) {
    throw new Error('No items found for game server');
  }

  const inventoryData: InventoryDataPoint[] = [];
  const baseTime = new Date('2024-01-01T00:00:00Z');

  // Generate inventory data for each player
  pogs.forEach((pog, pogIndex) => {
    switch (pogIndex) {
      case 0:
        // Player 0: Static inventory (always has first 2 items)
        for (let hour = 0; hour < 24 * 10; hour += 6) {
          // Every 6 hours for 10 days
          if (items.length > 0) {
            inventoryData.push({
              playerId: pog.id,
              itemId: items[0].id,
              quantity: 5,
              timestamp: new Date(baseTime.getTime() + hour * 3600000),
            });
          }
          if (items.length > 1) {
            inventoryData.push({
              playerId: pog.id,
              itemId: items[1].id,
              quantity: 3,
              timestamp: new Date(baseTime.getTime() + hour * 3600000),
            });
          }
        }
        break;

      case 1:
        // Player 1: Gradually gains items over time
        for (let day = 0; day < 10; day++) {
          const itemIndex = Math.min(day % items.length, items.length - 1);
          inventoryData.push({
            playerId: pog.id,
            itemId: items[itemIndex].id,
            quantity: day + 1,
            timestamp: new Date(baseTime.getTime() + day * 24 * 3600000),
          });
        }
        break;

      case 2:
        // Player 2: Items that come and go (simulating usage/trade)
        for (let day = 0; day < 15; day++) {
          if (items.length > 2) {
            const quantity = day % 2 === 0 ? 10 : 0; // Alternate between having and not having
            inventoryData.push({
              playerId: pog.id,
              itemId: items[2].id,
              quantity: quantity,
              timestamp: new Date(baseTime.getTime() + day * 12 * 3600000), // Every 12 hours
            });
          }
        }
        break;

      case 3:
        // Player 3: Has a specific item that others don't have for targeted testing
        if (items.length > 3) {
          for (let day = 5; day < 20; day++) {
            // Only has item from day 5 to 20
            inventoryData.push({
              playerId: pog.id,
              itemId: items[3].id,
              quantity: 1,
              timestamp: new Date(baseTime.getTime() + day * 24 * 3600000),
            });
          }
        }
        break;
    }
  });

  // Add some specific test points for precise testing
  if (pogs.length > 0 && items.length > 0) {
    // Test point for inventory history test
    inventoryData.push({
      playerId: pogs[0].id,
      itemId: items[0].id,
      quantity: 99,
      timestamp: new Date('2024-01-15T12:00:00Z'),
    });
  }

  // Ensure inventory partitions exist for all required dates
  for (let day = 0; day < 30; day++) {
    const partitionDate = new Date(baseTime.getTime() + day * 86400000);
    await repo.ensureInventoryPartition(partitionDate.toISOString());
  }

  // Insert inventory data
  if (inventoryData.length > 0) {
    const insertData = inventoryData.map((point) => ({
      playerId: point.playerId,
      itemId: point.itemId,
      quantity: point.quantity,
      createdAt: point.timestamp.toISOString(),
      domain: domainId,
    }));

    const knex = await repo.getKnex();
    await knex.batchInsert('playerInventoryHistory', insertData, 1000);
  }

  return {
    totalRecords: inventoryData.length,
    items: items,
    dateRange: {
      start: baseTime.toISOString(),
      end: new Date(baseTime.getTime() + 29 * 86400000).toISOString(),
    },
    testPoints: {
      inventoryTest: {
        playerId: pogs.length > 0 ? pogs[0].id : '',
        itemCode: items.length > 0 ? items[0].code : '',
        startDate: '2024-01-14T00:00:00Z',
        endDate: '2024-01-16T00:00:00Z',
        expectedRecords: pogs.length > 0 && items.length > 0 ? 1 : 0,
      },
      itemSearchTest: {
        itemId: items.length > 3 ? items[3].id : items.length > 0 ? items[0].id : '',
        expectedPlayers: items.length > 3 && pogs.length > 3 ? [pogs[3].id] : pogs.length > 0 ? [pogs[0].id] : [],
        dateRange: {
          start: '2024-01-10T00:00:00Z',
          end: '2024-01-25T00:00:00Z',
        },
      },
    },
  };
}

const tests = [
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Basic player movement history',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');
      await setupHistoricalData(this.standardDomainId, this.setupData.pogs1);
      const res = (await this.client.tracking.trackingControllerGetPlayerMovementHistory({})).data.data;
      expect(res.length).to.be.greaterThan(0);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Limit max is validated',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      try {
        await this.client.tracking.trackingControllerGetPlayerMovementHistory({ limit: 9999999 });
        throw new Error('Expected error not thrown');
      } catch (error) {
        if (!isAxiosError(error)) {
          throw error;
        }
        expect(error.response?.status).to.equal(400);
        expect(error.response?.data.meta.error.message).to.equal(
          'Invalid pagination: limit must be less than or equal to 1000',
        );
      }
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Get player movement history with date range filter',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');

      await setupHistoricalData(this.standardDomainId, this.setupData.pogs1);

      // Test with specific date range - should only get data from Jan 10-20
      const startDate = '2024-01-10T00:00:00Z';
      const endDate = '2024-01-20T23:59:59Z';

      const res = await this.client.tracking.trackingControllerGetPlayerMovementHistory({
        startDate,
        endDate,
      });

      const data = res.data.data;
      expect(data.length).to.be.greaterThan(0);

      // Verify all returned data is within the date range
      data.forEach((point) => {
        const pointDate = new Date(point.createdAt);
        expect(pointDate.getTime()).to.be.greaterThanOrEqual(new Date(startDate).getTime());
        expect(pointDate.getTime()).to.be.lessThanOrEqual(new Date(endDate).getTime());
      });
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Get player movement history without playerIds returns all players',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');

      await setupHistoricalData(this.standardDomainId, this.setupData.pogs1);

      // Get all movement history without specifying playerIds
      const res = await this.client.tracking.trackingControllerGetPlayerMovementHistory({});
      const data = res.data.data;

      // Collect unique player IDs from the response
      const uniquePlayerIds = new Set(data.map((point) => point.playerId));

      // Should have data for all players in pogs1
      expect(uniquePlayerIds.size).to.be.greaterThanOrEqual(this.setupData.pogs1.length);
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Get player movement history with specific playerIds filter',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');

      await setupHistoricalData(this.standardDomainId, this.setupData.pogs1);

      // Select first two players only
      const selectedPlayerIds = this.setupData.pogs1.slice(0, 2).map((pog) => pog.id);

      const res = await this.client.tracking.trackingControllerGetPlayerMovementHistory({
        playerId: selectedPlayerIds,
      });

      const data = res.data.data;
      expect(data.length).to.be.greaterThan(0);

      // Verify all returned data belongs only to the selected players
      data.forEach((point) => {
        expect(selectedPlayerIds).to.contain(point.playerId);
      });

      // Verify we don't have data from other players
      const returnedPlayerIds = new Set(data.map((point) => point.playerId));
      expect(returnedPlayerIds.size).to.be.lessThanOrEqual(selectedPlayerIds.length);
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Get players in bounding box',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');

      const generatedData = await setupHistoricalData(this.standardDomainId, this.setupData.pogs1);
      const testPoint = generatedData.testPoints.boundingBoxTest;

      const res = await this.client.tracking.trackingControllerGetBoundingBoxPlayers({
        minX: testPoint.box.minX,
        maxX: testPoint.box.maxX,
        minY: testPoint.box.minY,
        maxY: testPoint.box.maxY,
        minZ: testPoint.box.minZ,
        maxZ: testPoint.box.maxZ,
        timestamp: testPoint.timestamp,
      });

      const data = res.data.data;

      // Should find the expected player(s) in the bounding box
      const playerIds = data.map((location) => location.playerId);
      testPoint.expectedPlayers.forEach((expectedId) => {
        expect(playerIds).to.contain(expectedId);
      });
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Get players in bounding box with timestamp filter',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');

      await setupHistoricalData(this.standardDomainId, this.setupData.pogs1);

      // Test with a timestamp where we know player positions
      const timestamp = '2024-01-01T12:00:00Z';

      // Define a box that should contain player 0 (stationary at 100, 50, 100)
      const res = await this.client.tracking.trackingControllerGetBoundingBoxPlayers({
        minX: 50,
        maxX: 150,
        minY: 0,
        maxY: 100,
        minZ: 50,
        maxZ: 150,
        timestamp: timestamp,
      });

      const data = res.data.data;

      if (this.setupData.pogs1.length === 0) {
        throw new Error('Test setup failed: No players found in setupData.pogs1');
      }

      // Should find at least player 0
      const playerIds = data.map((location) => location.playerId);
      expect(playerIds).to.contain(this.setupData.pogs1[0].id);
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Get players within radius',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');

      const generatedData = await setupHistoricalData(this.standardDomainId, this.setupData.pogs1);
      const testPoint = generatedData.testPoints.radiusTest;

      const res = await this.client.tracking.trackingControllerGetRadiusPlayers({
        x: testPoint.center.x,
        y: testPoint.center.y,
        z: testPoint.center.z,
        radius: testPoint.radius,
        timestamp: testPoint.timestamp,
      });

      const data = res.data.data;

      // Should find the expected player(s) within radius
      const playerIds = data.map((location) => location.playerId);
      testPoint.expectedPlayers.forEach((expectedId) => {
        expect(playerIds).to.contain(expectedId);
      });
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Get players within radius with timestamp filter',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');

      await setupHistoricalData(this.standardDomainId, this.setupData.pogs1);

      // Test with a timestamp where we know player 2 is moving in a circle around (500, 100, 500)
      const timestamp = '2024-01-01T06:00:00Z'; // 6 hours = 1/4 of circle

      const res = await this.client.tracking.trackingControllerGetRadiusPlayers({
        x: 500,
        y: 100,
        z: 500,
        radius: 150, // Slightly larger than the 100 unit circle radius
        timestamp: timestamp,
      });

      const data = res.data.data;

      if (this.setupData.pogs1.length < 3) {
        throw new Error('Test setup failed: Need at least 3 players for this test');
      }

      // Should find at least player 2
      const playerIds = data.map((location) => location.playerId);
      expect(playerIds).to.contain(this.setupData.pogs1[2].id);
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Verify no players found outside bounding box',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');

      await setupHistoricalData(this.standardDomainId, this.setupData.pogs1);

      // Define a box that should contain no players
      const res = await this.client.tracking.trackingControllerGetBoundingBoxPlayers({
        minX: 10000,
        maxX: 11000,
        minY: 1000,
        maxY: 2000,
        minZ: 10000,
        maxZ: 11000,
        timestamp: '2024-01-15T12:00:00Z',
      });

      const data = res.data.data;
      expect(data.length).to.equal(0);
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Verify no players found outside radius',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');

      await setupHistoricalData(this.standardDomainId, this.setupData.pogs1);

      // Define a point far from any player activity
      const res = await this.client.tracking.trackingControllerGetRadiusPlayers({
        x: 50000,
        y: 5000,
        z: 50000,
        radius: 10,
        timestamp: '2024-01-15T12:00:00Z',
      });

      const data = res.data.data;
      expect(data.length).to.equal(0);
    },
  }),

  // Inventory tracking tests
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Get player inventory history basic test',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');

      const inventoryData = await setupInventoryData(
        this.standardDomainId,
        this.setupData.pogs1,
        this.setupData.gameServer1.id,
        this.client,
      );

      if (this.setupData.pogs1.length === 0) {
        throw new Error('Test setup failed: No players found in setupData.pogs1');
      }

      const testPoint = inventoryData.testPoints.inventoryTest;
      const res = await this.client.tracking.trackingControllerGetPlayerInventoryHistory({
        playerId: testPoint.playerId,
        startDate: testPoint.startDate,
        endDate: testPoint.endDate,
      });

      const data = res.data.data;
      expect(data.length).to.be.greaterThanOrEqual(testPoint.expectedRecords);

      // Verify all returned data belongs to the requested player
      data.forEach((item) => {
        expect(item.playerId).to.equal(testPoint.playerId);
      });
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Get player inventory history with date range validation',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');

      await setupInventoryData(this.standardDomainId, this.setupData.pogs1, this.setupData.gameServer1.id, this.client);

      if (this.setupData.pogs1.length === 0) {
        throw new Error('Test setup failed: No players found in setupData.pogs1');
      }

      const playerId = this.setupData.pogs1[0].id;
      const startDate = '2024-01-05T00:00:00Z';
      const endDate = '2024-01-10T23:59:59Z';

      const res = await this.client.tracking.trackingControllerGetPlayerInventoryHistory({
        playerId,
        startDate,
        endDate,
      });

      const data = res.data.data;

      // Verify all returned data is within the date range
      data.forEach((item) => {
        const itemDate = new Date(item.createdAt);
        expect(itemDate.getTime()).to.be.greaterThanOrEqual(new Date(startDate).getTime());
        expect(itemDate.getTime()).to.be.lessThanOrEqual(new Date(endDate).getTime());
      });
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Get player inventory history with player having no inventory returns empty',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');

      // Only set up inventory data for first 2 players, leaving others without data
      const playersWithInventory = this.setupData.pogs1.slice(0, 2);
      await setupInventoryData(this.standardDomainId, playersWithInventory, this.setupData.gameServer1.id, this.client);

      if (this.setupData.pogs1.length < 3) {
        throw new Error('Test setup failed: Need at least 3 players for this test');
      }

      // Use a player that has no inventory data
      const playerWithoutInventory = this.setupData.pogs1[2].id;

      const res = await this.client.tracking.trackingControllerGetPlayerInventoryHistory({
        playerId: playerWithoutInventory,
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-02T00:00:00Z',
      });

      const data = res.data.data;

      // Should return empty since this player has no inventory data
      expect(data.length).to.equal(0);
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Get players by item basic test',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');

      const inventoryData = await setupInventoryData(
        this.standardDomainId,
        this.setupData.pogs1,
        this.setupData.gameServer1.id,
        this.client,
      );

      const testPoint = inventoryData.testPoints.itemSearchTest;
      const res = await this.client.tracking.trackingControllerGetPlayersByItem({
        itemId: testPoint.itemId,
        startDate: testPoint.dateRange.start,
        endDate: testPoint.dateRange.end,
      });

      const data = res.data.data;
      expect(data.length).to.be.greaterThan(0);

      // Verify all returned data has valid quantities and timestamps
      data.forEach((item) => {
        expect(item.quantity).to.be.greaterThanOrEqual(0);
        expect(item.createdAt).to.be.a('string');
        expect(item.playerId).to.be.a('string');
      });
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Get players by item with date range filtering',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');

      const inventoryData = await setupInventoryData(
        this.standardDomainId,
        this.setupData.pogs1,
        this.setupData.gameServer1.id,
        this.client,
      );

      if (inventoryData.items.length === 0) {
        throw new Error('Test setup failed: No items found in inventoryData.items');
      }

      const startDate = '2024-01-15T00:00:00Z';
      const endDate = '2024-01-20T23:59:59Z';

      const res = await this.client.tracking.trackingControllerGetPlayersByItem({
        itemId: inventoryData.items[0].id,
        startDate,
        endDate,
      });

      const data = res.data.data;

      // Verify all returned data is within the date range
      data.forEach((item) => {
        const itemDate = new Date(item.createdAt);
        expect(itemDate.getTime()).to.be.greaterThanOrEqual(new Date(startDate).getTime());
        expect(itemDate.getTime()).to.be.lessThanOrEqual(new Date(endDate).getTime());
      });
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Get players by item without date filters returns all history',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');

      const inventoryData = await setupInventoryData(
        this.standardDomainId,
        this.setupData.pogs1,
        this.setupData.gameServer1.id,
        this.client,
      );

      if (inventoryData.items.length === 0) {
        throw new Error('Test setup failed: No items found in inventoryData.items');
      }

      const res = await this.client.tracking.trackingControllerGetPlayersByItem({
        itemId: inventoryData.items[0].id,
      });

      const data = res.data.data;
      expect(data.length).to.be.greaterThan(0);

      // Verify data spans multiple days (indicating no date filtering)
      const timestamps = data.map((item) => new Date(item.createdAt).getTime());
      const minTime = Math.min(...timestamps);
      const maxTime = Math.max(...timestamps);
      const timeDiff = maxTime - minTime;
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

      expect(daysDiff).to.be.greaterThan(1); // Should span multiple days
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Get players by non-existent item returns empty',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');

      await setupInventoryData(this.standardDomainId, this.setupData.pogs1, this.setupData.gameServer1.id, this.client);

      const res = await this.client.tracking.trackingControllerGetPlayersByItem({
        itemId: '550e8400-e29b-41d4-a716-446655440000', // Non-existent item ID
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-02T00:00:00Z',
      });

      const data = res.data.data;
      expect(data.length).to.equal(0);
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Combined location and inventory tracking test',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('standardDomainId is not set');

      // Set up both location and inventory data
      await Promise.all([
        setupHistoricalData(this.standardDomainId, this.setupData.pogs1),
        setupInventoryData(this.standardDomainId, this.setupData.pogs1, this.setupData.gameServer1.id, this.client),
      ]);

      if (this.setupData.pogs1.length === 0) {
        throw new Error('Test setup failed: No players found in setupData.pogs1');
      }

      // Test that both location and inventory endpoints work
      const [locationRes, inventoryRes] = await Promise.all([
        this.client.tracking.trackingControllerGetPlayerMovementHistory({
          playerId: [this.setupData.pogs1[0].id],
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-10T00:00:00Z',
        }),
        this.client.tracking.trackingControllerGetPlayerInventoryHistory({
          playerId: this.setupData.pogs1[0].id,
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-10T00:00:00Z',
        }),
      ]);

      const locationData = locationRes.data.data;
      const inventoryData = inventoryRes.data.data;

      // Verify both have data
      expect(locationData.length).to.be.greaterThan(0);
      expect(inventoryData.length).to.be.greaterThan(0);

      // Verify all data belongs to the same player
      locationData.forEach((item) => {
        expect(item.playerId).to.equal(this.setupData.pogs1[0].id);
      });
      inventoryData.forEach((item) => {
        expect(item.playerId).to.equal(this.setupData.pogs1[0].id);
      });
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
