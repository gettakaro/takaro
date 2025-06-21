import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { ActivitySimulator, ActivitySimulatorOptions } from './ActivitySimulator.js';
import { IGamePlayer } from '@takaro/modules';

// Mock dependencies
class MockDataHandler {
  private players: Array<{ player: IGamePlayer; meta: any }> = [];

  async getOnlinePlayers() {
    return this.players.filter((p) => p.meta.online);
  }

  async getAllPlayers() {
    return this.players;
  }

  async updatePlayerPosition(gameId: string, position: any) {
    const player = this.players.find((p) => p.player.gameId === gameId);
    if (player) {
      player.meta.position = position;
    }
  }

  // Test helper methods
  addTestPlayer(gameId: string, name: string, online: boolean = true) {
    this.players.push({
      player: new IGamePlayer({ gameId, name }),
      meta: {
        position: { x: 0, y: 64, z: 0, dimension: 'overworld' },
        online,
      },
    });
  }

  getTestPlayers() {
    return this.players;
  }

  clearPlayers() {
    this.players = [];
  }
}

class MockEventEmitter {
  events: Array<{ type: string; data: any }> = [];

  async emit(type: string, data: any) {
    this.events.push({ type, data });
  }

  getEvents() {
    return this.events;
  }

  clearEvents() {
    this.events = [];
  }

  getEventsByType(type: string) {
    return this.events.filter((e) => e.type === type);
  }
}

describe('ActivitySimulator', () => {
  let mockDataHandler: MockDataHandler;
  let mockEventEmitter: MockEventEmitter;
  let simulator: ActivitySimulator;
  let options: ActivitySimulatorOptions;

  beforeEach(() => {
    mockDataHandler = new MockDataHandler();
    mockEventEmitter = new MockEventEmitter();

    options = {
      dataHandler: mockDataHandler as any,
      eventEmitter: mockEventEmitter.emit.bind(mockEventEmitter),
      config: {
        chatMessageFreq: { minInterval: 100, maxInterval: 200, enabled: true },
        playerMovementFreq: { minInterval: 100, maxInterval: 200, enabled: true },
        connectionFreq: { minInterval: 500, maxInterval: 1000, enabled: true },
        deathFreq: { minInterval: 500, maxInterval: 1000, enabled: true },
        killFreq: { minInterval: 500, maxInterval: 1000, enabled: true },
        itemInteractionFreq: { minInterval: 500, maxInterval: 1000, enabled: true },
      },
    };

    simulator = new ActivitySimulator(options);

    // Add test players
    mockDataHandler.addTestPlayer('player1', 'TestPlayer1', true);
    mockDataHandler.addTestPlayer('player2', 'TestPlayer2', true);
    mockDataHandler.addTestPlayer('player3', 'TestPlayer3', false);
  });

  afterEach(async () => {
    if (simulator.isActive()) {
      await simulator.stop();
    }
    mockDataHandler.clearPlayers();
    mockEventEmitter.clearEvents();
  });

  describe('State Management', () => {
    it('should start and stop simulation correctly', async () => {
      assert.strictEqual(simulator.isActive(), false, 'Simulator should start inactive');

      await simulator.start();
      assert.strictEqual(simulator.isActive(), true, 'Simulator should be active after start');

      await simulator.stop();
      assert.strictEqual(simulator.isActive(), false, 'Simulator should be inactive after stop');
    });

    it('should handle multiple start calls gracefully', async () => {
      await simulator.start();
      assert.strictEqual(simulator.isActive(), true);

      // Second start should not throw error
      await simulator.start();
      assert.strictEqual(simulator.isActive(), true);
    });

    it('should handle multiple stop calls gracefully', async () => {
      await simulator.start();
      await simulator.stop();
      assert.strictEqual(simulator.isActive(), false);

      // Second stop should not throw error
      await simulator.stop();
      assert.strictEqual(simulator.isActive(), false);
    });

    it('should handle stop without start gracefully', async () => {
      assert.strictEqual(simulator.isActive(), false);

      // Stop without start should not throw error
      await simulator.stop();
      assert.strictEqual(simulator.isActive(), false);
    });
  });

  describe('Configuration Management', () => {
    it('should return current configuration', () => {
      const config = simulator.getConfig();
      assert.ok(config.chatMessageFreq, 'Config should have chatMessageFreq');
      assert.ok(config.playerMovementFreq, 'Config should have playerMovementFreq');
      assert.strictEqual(config.chatMessageFreq.enabled, true, 'Chat messages should be enabled');
    });

    it('should update configuration', () => {
      const newConfig = {
        chatMessageFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
      };

      simulator.updateConfig(newConfig);
      const updatedConfig = simulator.getConfig();

      assert.strictEqual(updatedConfig.chatMessageFreq.enabled, false, 'Chat messages should be disabled');
      assert.strictEqual(updatedConfig.chatMessageFreq.minInterval, 1000, 'Min interval should be updated');
    });

    it('should preserve other config values when updating partial config', () => {
      const originalConfig = simulator.getConfig();

      simulator.updateConfig({
        chatMessageFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
      });

      const updatedConfig = simulator.getConfig();

      assert.strictEqual(
        updatedConfig.playerMovementFreq.enabled,
        originalConfig.playerMovementFreq.enabled,
        'Other config values should be preserved',
      );
    });
  });

  describe('Event Generation', () => {
    it('should generate events when simulation is active', async () => {
      // Use shorter intervals for testing
      const testConfig = {
        chatMessageFreq: { minInterval: 50, maxInterval: 100, enabled: true },
        playerMovementFreq: { minInterval: 50, maxInterval: 100, enabled: true },
        connectionFreq: { minInterval: 1000, maxInterval: 2000, enabled: false }, // Disable slow events
        deathFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
        killFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
        itemInteractionFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
      };

      simulator.updateConfig(testConfig);
      await simulator.start();

      // Wait for some events to be generated
      await new Promise((resolve) => setTimeout(resolve, 300));

      await simulator.stop();

      const events = mockEventEmitter.getEvents();
      assert.ok(events.length > 0, 'Should generate some events');
    });

    it('should not generate events when simulation is stopped', async () => {
      // Start and then immediately stop
      await simulator.start();
      await simulator.stop();

      const initialEventCount = mockEventEmitter.getEvents().length;

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 200));

      const finalEventCount = mockEventEmitter.getEvents().length;
      assert.strictEqual(finalEventCount, initialEventCount, 'Should not generate new events after stopping');
    });

    it('should handle empty player list gracefully', async () => {
      mockDataHandler.clearPlayers();

      const testConfig = {
        chatMessageFreq: { minInterval: 50, maxInterval: 100, enabled: true },
        playerMovementFreq: { minInterval: 50, maxInterval: 100, enabled: true },
        connectionFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
        deathFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
        killFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
        itemInteractionFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
      };

      simulator.updateConfig(testConfig);
      await simulator.start();

      // Wait and verify no crashes occur
      await new Promise((resolve) => setTimeout(resolve, 200));

      await simulator.stop();

      // Should not crash with empty player list
      assert.ok(true, 'Should handle empty player list without crashing');
    });
  });

  describe('Player Movement Integration', () => {
    it('should update player positions when movement is enabled', async () => {
      const testConfig = {
        chatMessageFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
        playerMovementFreq: { minInterval: 50, maxInterval: 100, enabled: true },
        connectionFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
        deathFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
        killFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
        itemInteractionFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
      };

      simulator.updateConfig(testConfig);

      const initialPositions = mockDataHandler.getTestPlayers().map((p) => ({ ...p.meta.position }));

      await simulator.start();
      await new Promise((resolve) => setTimeout(resolve, 200));
      await simulator.stop();

      const finalPositions = mockDataHandler.getTestPlayers().map((p) => ({ ...p.meta.position }));

      // At least some players should have moved
      let somePlayerMoved = false;
      for (let i = 0; i < initialPositions.length; i++) {
        const initial = initialPositions[i];
        const final = finalPositions[i];
        if (initial.x !== final.x || initial.y !== final.y || initial.z !== final.z) {
          somePlayerMoved = true;
          break;
        }
      }

      assert.ok(somePlayerMoved, 'At least one player should have moved');
    });

    it('should not update positions when movement is disabled', async () => {
      const testConfig = {
        chatMessageFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
        playerMovementFreq: { minInterval: 50, maxInterval: 100, enabled: false },
        connectionFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
        deathFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
        killFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
        itemInteractionFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
      };

      simulator.updateConfig(testConfig);

      const initialPositions = mockDataHandler.getTestPlayers().map((p) => ({ ...p.meta.position }));

      await simulator.start();
      await new Promise((resolve) => setTimeout(resolve, 200));
      await simulator.stop();

      const finalPositions = mockDataHandler.getTestPlayers().map((p) => ({ ...p.meta.position }));

      // No players should have moved
      for (let i = 0; i < initialPositions.length; i++) {
        const initial = initialPositions[i];
        const final = finalPositions[i];
        assert.strictEqual(initial.x, final.x, 'X position should not change when movement disabled');
        assert.strictEqual(initial.y, final.y, 'Y position should not change when movement disabled');
        assert.strictEqual(initial.z, final.z, 'Z position should not change when movement disabled');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle DataHandler errors gracefully', async () => {
      // Create a mock that throws errors
      const errorDataHandler = {
        async getOnlinePlayers() {
          throw new Error('Database connection failed');
        },
        async getAllPlayers() {
          throw new Error('Database connection failed');
        },
        async updatePlayerPosition() {
          throw new Error('Update failed');
        },
      };

      const errorSimulator = new ActivitySimulator({
        dataHandler: errorDataHandler as any,
        eventEmitter: mockEventEmitter.emit.bind(mockEventEmitter),
        config: {
          chatMessageFreq: { minInterval: 50, maxInterval: 100, enabled: true },
          playerMovementFreq: { minInterval: 50, maxInterval: 100, enabled: true },
          connectionFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
          deathFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
          killFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
          itemInteractionFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
        },
      });

      // Should not throw error even with failing DataHandler
      await errorSimulator.start();
      await new Promise((resolve) => setTimeout(resolve, 200));
      await errorSimulator.stop();

      assert.ok(true, 'Should handle DataHandler errors gracefully');
    });

    it('should handle event emitter errors gracefully', async () => {
      // Create a mock event emitter that throws errors
      const errorEventEmitter = async () => {
        throw new Error('Event emission failed');
      };

      const errorSimulator = new ActivitySimulator({
        dataHandler: mockDataHandler as any,
        eventEmitter: errorEventEmitter,
        config: {
          chatMessageFreq: { minInterval: 50, maxInterval: 100, enabled: true },
          playerMovementFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
          connectionFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
          deathFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
          killFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
          itemInteractionFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
        },
      });

      // Should not throw error even with failing event emitter
      await errorSimulator.start();
      await new Promise((resolve) => setTimeout(resolve, 200));
      await errorSimulator.stop();

      assert.ok(true, 'Should handle event emitter errors gracefully');
    });
  });
});
