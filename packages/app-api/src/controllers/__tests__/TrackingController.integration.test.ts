import { IntegrationTest, expect, SetupGameServerPlayers } from '@takaro/test';
import { isAxiosError, PlayerOnGameserverOutputDTO } from '@takaro/apiclient';
import { describe } from 'node:test';
import { TrackingRepo } from '../../db/tracking.js';

const group = 'TrackingController';

interface TrackingDataPoint {
  playerId: string;
  x: number;
  y: number;
  z: number;
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
        expect(error.response?.data.meta.error.message).to.be.eq(
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
        expect(selectedPlayerIds).to.include(point.playerId);
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
        expect(playerIds).to.include(expectedId);
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

      // Should find at least player 0
      if (this.setupData.pogs1.length > 0) {
        const playerIds = data.map((location) => location.playerId);
        expect(playerIds).to.include(this.setupData.pogs1[0].id);
      }
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
        expect(playerIds).to.include(expectedId);
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

      // Should find at least player 2 if present
      if (this.setupData.pogs1.length > 2) {
        const playerIds = data.map((location) => location.playerId);
        expect(playerIds).to.include(this.setupData.pogs1[2].id);
      }
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
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
