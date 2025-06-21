import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { SimulationState, DEFAULT_SIMULATION_CONFIG } from './SimulationState.js';

describe('SimulationState', () => {
  let state: SimulationState;

  beforeEach(() => {
    state = new SimulationState();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const config = state.getConfig();
      assert.ok(config.chatMessageFreq, 'Should have chat message frequency config');
      assert.ok(config.playerMovementFreq, 'Should have player movement frequency config');
      assert.strictEqual(config.chatMessageFreq.enabled, true, 'Chat messages should be enabled by default');
    });

    it('should initialize as inactive', () => {
      assert.strictEqual(state.isActive(), false, 'Should start inactive');
    });

    it('should accept custom configuration', () => {
      const customConfig = {
        chatMessageFreq: { minInterval: 1000, maxInterval: 2000, enabled: false },
      };

      const customState = new SimulationState(customConfig);
      const config = customState.getConfig();

      assert.strictEqual(config.chatMessageFreq.enabled, false, 'Custom config should be applied');
      assert.strictEqual(config.chatMessageFreq.minInterval, 1000, 'Custom intervals should be applied');
    });
  });

  describe('State Management', () => {
    it('should start simulation', () => {
      state.start();
      assert.strictEqual(state.isActive(), true, 'Should be active after start');
    });

    it('should stop simulation', () => {
      state.start();
      state.stop();
      assert.strictEqual(state.isActive(), false, 'Should be inactive after stop');
    });

    it('should handle multiple start calls', () => {
      state.start();
      state.start(); // Should not throw
      assert.strictEqual(state.isActive(), true, 'Should remain active');
    });

    it('should handle multiple stop calls', () => {
      state.start();
      state.stop();
      state.stop(); // Should not throw
      assert.strictEqual(state.isActive(), false, 'Should remain inactive');
    });

    it('should handle stop without start', () => {
      state.stop(); // Should not throw
      assert.strictEqual(state.isActive(), false, 'Should remain inactive');
    });
  });

  describe('Configuration Management', () => {
    it('should return immutable configuration copy', () => {
      const config1 = state.getConfig();
      const config2 = state.getConfig();

      assert.notStrictEqual(config1, config2, 'Should return different object instances');
      assert.deepStrictEqual(config1, config2, 'Should have same content');

      // Modifying returned config should not affect internal state
      config1.chatMessageFreq.enabled = false;
      const config3 = state.getConfig();
      assert.strictEqual(config3.chatMessageFreq.enabled, true, 'Internal config should be unchanged');
    });

    it('should update configuration', () => {
      const updates = {
        chatMessageFreq: { minInterval: 5000, maxInterval: 10000, enabled: false },
      };

      state.updateConfig(updates);
      const config = state.getConfig();

      assert.strictEqual(config.chatMessageFreq.enabled, false, 'Should update enabled flag');
      assert.strictEqual(config.chatMessageFreq.minInterval, 5000, 'Should update min interval');
      assert.strictEqual(config.chatMessageFreq.maxInterval, 10000, 'Should update max interval');
    });

    it('should preserve unmodified configuration values', () => {
      const originalConfig = state.getConfig();

      state.updateConfig({
        chatMessageFreq: { minInterval: 5000, maxInterval: 10000, enabled: false },
      });

      const updatedConfig = state.getConfig();
      assert.deepStrictEqual(
        updatedConfig.playerMovementFreq,
        originalConfig.playerMovementFreq,
        'Unmodified config should be preserved',
      );
    });

    it('should reset configuration to defaults', () => {
      state.updateConfig({
        chatMessageFreq: { minInterval: 5000, maxInterval: 10000, enabled: false },
      });

      state.resetConfig();
      const config = state.getConfig();

      assert.deepStrictEqual(config, DEFAULT_SIMULATION_CONFIG, 'Should reset to default configuration');
    });
  });

  describe('Statistics', () => {
    it('should provide simulation statistics', () => {
      const stats = state.getStats();

      assert.strictEqual(stats.isRunning, false, 'Should show not running initially');
      assert.strictEqual(stats.startedAt, undefined, 'Should have no start time initially');
      assert.strictEqual(stats.uptimeMs, undefined, 'Should have no uptime initially');
      assert.ok(stats.config, 'Should include configuration');
    });

    it('should track start time', () => {
      state.start();
      const stats = state.getStats();

      assert.strictEqual(stats.isRunning, true, 'Should show running');
      assert.ok(stats.startedAt, 'Should have start time');
      assert.ok(typeof stats.uptimeMs === 'number' && stats.uptimeMs >= 0, 'Should have valid uptime');
    });

    it('should track stop time', () => {
      state.start();
      state.stop();
      const stats = state.getStats();

      assert.strictEqual(stats.isRunning, false, 'Should show not running');
      assert.ok(stats.stoppedAt, 'Should have stop time');
      assert.strictEqual(stats.uptimeMs, undefined, 'Should have no uptime when stopped');
    });
  });

  describe('Event Type Management', () => {
    it('should enable/disable specific event types', () => {
      state.enableEventType('chatMessageFreq', false);
      const config = state.getConfig();

      assert.strictEqual(config.chatMessageFreq.enabled, false, 'Should disable chat messages');
      assert.strictEqual(config.playerMovementFreq.enabled, true, 'Other events should remain enabled');
    });

    it('should handle invalid event types gracefully', () => {
      // Should not throw error for invalid event type
      state.enableEventType('invalidEventType' as any, false);

      // Configuration should remain unchanged
      const config = state.getConfig();
      assert.deepStrictEqual(config, DEFAULT_SIMULATION_CONFIG, 'Config should be unchanged');
    });

    it('should update event frequency', () => {
      state.updateEventFrequency('chatMessageFreq', {
        minInterval: 1000,
        maxInterval: 2000,
      });

      const config = state.getConfig();
      assert.strictEqual(config.chatMessageFreq.minInterval, 1000, 'Should update min interval');
      assert.strictEqual(config.chatMessageFreq.maxInterval, 2000, 'Should update max interval');
      assert.strictEqual(config.chatMessageFreq.enabled, true, 'Should preserve enabled flag');
    });

    it('should validate frequency updates', () => {
      // This should be rejected (min > max)
      state.updateEventFrequency('chatMessageFreq', {
        minInterval: 2000,
        maxInterval: 1000,
      });

      const config = state.getConfig();
      // Should remain unchanged due to validation error
      assert.strictEqual(config.chatMessageFreq.minInterval, DEFAULT_SIMULATION_CONFIG.chatMessageFreq.minInterval);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate valid configuration', () => {
      const validConfig = {
        chatMessageFreq: { minInterval: 1000, maxInterval: 2000, enabled: true },
      };

      const errors = state.validateConfig(validConfig);
      assert.strictEqual(errors.length, 0, 'Valid config should have no errors');
    });

    it('should detect negative intervals', () => {
      const invalidConfig = {
        chatMessageFreq: { minInterval: -1000, maxInterval: 2000, enabled: true },
      };

      const errors = state.validateConfig(invalidConfig);
      assert.ok(errors.length > 0, 'Should detect negative interval');
      assert.ok(
        errors.some((e) => e.includes('minInterval must be >= 0')),
        'Should have specific error message',
      );
    });

    it('should detect min > max intervals', () => {
      const invalidConfig = {
        chatMessageFreq: { minInterval: 3000, maxInterval: 2000, enabled: true },
      };

      const errors = state.validateConfig(invalidConfig);
      assert.ok(errors.length > 0, 'Should detect min > max');
      assert.ok(
        errors.some((e) => e.includes('minInterval must be <= maxInterval')),
        'Should have specific error message',
      );
    });

    it('should detect invalid enabled flag', () => {
      const invalidConfig = {
        chatMessageFreq: { minInterval: 1000, maxInterval: 2000, enabled: 'yes' as any },
      };

      const errors = state.validateConfig(invalidConfig);
      assert.ok(errors.length > 0, 'Should detect invalid enabled flag');
      assert.ok(
        errors.some((e) => e.includes('enabled must be a boolean')),
        'Should have specific error message',
      );
    });
  });
});
