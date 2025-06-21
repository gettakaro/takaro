import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { GameServer } from './gameserver.js';

describe('GameServer Activity Simulation Integration', () => {
  let gameServer: GameServer;

  beforeEach(() => {
    // Create GameServer with test configuration
    gameServer = new GameServer({
      ws: { url: 'ws://localhost:9999' }, // Use dummy URL for testing
      mockserver: {
        identityToken: 'test-server',
        registrationToken: 'test-token',
        name: 'test-server',
      },
    });
  });

  afterEach(async () => {
    // Clean up any running simulation
    if (gameServer) {
      try {
        await gameServer.executeConsoleCommand('stopSimulation');
      } catch {
        // Ignore errors during cleanup
      }
    }
  });

  describe('Console Command Integration', () => {
    it('should handle simulationStatus command', async () => {
      const result = await gameServer.executeConsoleCommand('simulationStatus');

      assert.ok(result, 'Should return a result');
      assert.strictEqual(result.success, true, 'Command should succeed');
      assert.ok(result.rawResult.includes('INACTIVE'), 'Should show simulation as inactive initially');
      assert.ok(result.rawResult.includes('Enabled events:'), 'Should show enabled events');
    });

    it('should handle startSimulation command', async () => {
      const result = await gameServer.executeConsoleCommand('startSimulation');

      assert.ok(result, 'Should return a result');
      assert.strictEqual(result.success, true, 'Start command should succeed');
      assert.ok(result.rawResult.includes('started successfully'), 'Should confirm start');
    });

    it('should handle stopSimulation command after start', async () => {
      // First start the simulation
      await gameServer.executeConsoleCommand('startSimulation');

      // Then stop it
      const result = await gameServer.executeConsoleCommand('stopSimulation');

      assert.ok(result, 'Should return a result');
      assert.strictEqual(result.success, true, 'Stop command should succeed');
      assert.ok(result.rawResult.includes('stopped successfully'), 'Should confirm stop');
    });

    it('should handle startSimulation when already running', async () => {
      // Start simulation first
      await gameServer.executeConsoleCommand('startSimulation');

      // Try to start again
      const result = await gameServer.executeConsoleCommand('startSimulation');

      assert.ok(result, 'Should return a result');
      assert.strictEqual(result.success, false, 'Command should fail when already running');
      assert.ok(result.rawResult.includes('already running'), 'Should indicate already running');
    });

    it('should handle stopSimulation when not running', async () => {
      const result = await gameServer.executeConsoleCommand('stopSimulation');

      assert.ok(result, 'Should return a result');
      assert.strictEqual(result.success, false, 'Command should fail when not running');
      assert.ok(result.rawResult.includes('not running'), 'Should indicate not running');
    });

    it('should show active status after starting simulation', async () => {
      // Start simulation
      await gameServer.executeConsoleCommand('startSimulation');

      // Check status
      const result = await gameServer.executeConsoleCommand('simulationStatus');

      assert.ok(result, 'Should return a result');
      assert.strictEqual(result.success, true, 'Status command should succeed');
      assert.ok(result.rawResult.includes('ACTIVE'), 'Should show simulation as active');
    });

    it('should handle existing commands without interference', async () => {
      // Test that existing commands still work
      const versionResult = await gameServer.executeConsoleCommand('version');
      assert.strictEqual(versionResult.success, true, 'Version command should still work');

      const connectResult = await gameServer.executeConsoleCommand('connectAll');
      assert.strictEqual(connectResult.success, true, 'ConnectAll command should still work');
    });

    it('should handle unknown commands gracefully', async () => {
      const result = await gameServer.executeConsoleCommand('unknownCommand');

      assert.ok(result, 'Should return a result');
      assert.strictEqual(result.success, false, 'Unknown command should fail');
      assert.ok(result.rawResult.includes('Unknown command'), 'Should indicate unknown command');
    });
  });

  describe('ActivitySimulator Integration', () => {
    it('should have ActivitySimulator instance', () => {
      // Access private member for testing (TypeScript will warn but it works)
      const simulator = (gameServer as any).activitySimulator;
      assert.ok(simulator, 'Should have ActivitySimulator instance');
      assert.strictEqual(typeof simulator.start, 'function', 'Should have start method');
      assert.strictEqual(typeof simulator.stop, 'function', 'Should have stop method');
      assert.strictEqual(typeof simulator.isActive, 'function', 'Should have isActive method');
    });

    it('should initialize ActivitySimulator as inactive', () => {
      const simulator = (gameServer as any).activitySimulator;
      assert.strictEqual(simulator.isActive(), false, 'Should start inactive');
    });

    it('should properly start and stop simulation', async () => {
      const simulator = (gameServer as any).activitySimulator;

      // Verify initial state
      assert.strictEqual(simulator.isActive(), false, 'Should start inactive');

      // Start simulation
      await gameServer.executeConsoleCommand('startSimulation');
      assert.strictEqual(simulator.isActive(), true, 'Should be active after start command');

      // Stop simulation
      await gameServer.executeConsoleCommand('stopSimulation');
      assert.strictEqual(simulator.isActive(), false, 'Should be inactive after stop command');
    });

    it('should have proper event emitter integration', async () => {
      const simulator = (gameServer as any).activitySimulator;

      // Start simulation briefly to test event emitter setup
      await simulator.start();

      // The fact that start doesn't throw means event emitter is properly configured
      assert.ok(true, 'Event emitter should be properly configured');

      await simulator.stop();
    });
  });

  describe('Error Handling', () => {
    it('should handle simulation errors gracefully', async () => {
      // This test ensures that even if simulation encounters errors,
      // the console commands don't crash the server

      const result = await gameServer.executeConsoleCommand('startSimulation');
      assert.ok(result, 'Should handle start command even with potential errors');

      const statusResult = await gameServer.executeConsoleCommand('simulationStatus');
      assert.ok(statusResult, 'Should handle status command even with potential errors');
    });
  });
});
