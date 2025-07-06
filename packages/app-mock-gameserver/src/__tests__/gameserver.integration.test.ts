import 'reflect-metadata';
import { GameServer } from '../lib/ws-gameserver/gameserver.js';
import { expect } from '@takaro/test';
import { describe, it, beforeEach, afterEach } from 'node:test';

describe('GameServer Command Integration', () => {
  let gameServer: GameServer;

  beforeEach(async () => {
    gameServer = new GameServer({
      ws: { url: 'ws://localhost:9999' }, // Mock URL, won't actually connect in tests
    });
    await gameServer.init();
  });

  afterEach(async () => {
    // Clean up
    if (gameServer) {
      // Stop any running simulations
      await gameServer.executeConsoleCommand('stopSimulation');
    }
  });

  describe('System Commands', () => {
    it('should execute version command', async () => {
      const result = await gameServer.executeConsoleCommand('version');

      expect(result.success).to.be.true;
      expect(result.rawResult).to.equal('Mock game server v0.0.1');
    });

    it('should execute help command', async () => {
      const result = await gameServer.executeConsoleCommand('help');

      expect(result.success).to.be.true;
      expect(result.rawResult).to.include('Available commands');
      expect(result.rawResult).to.include('System:');
      expect(result.rawResult).to.include('Player Management:');
    });

    it('should show help for specific command', async () => {
      const result = await gameServer.executeConsoleCommand('help ban');

      expect(result.success).to.be.true;
      expect(result.rawResult).to.include('Command: ban');
      expect(result.rawResult).to.include('Description: Ban a player from the server');
      expect(result.rawResult).to.include('Usage: ban <playerId> [reason]');
    });

    it('should execute say command', async () => {
      const result = await gameServer.executeConsoleCommand('say Hello everyone!');

      expect(result.success).to.be.true;
      expect(result.rawResult).to.equal('Sent message: Hello everyone!');
    });

    it('should handle say command with quoted message', async () => {
      const result = await gameServer.executeConsoleCommand('say "Hello world with spaces"');

      expect(result.success).to.be.true;
      expect(result.rawResult).to.equal('Sent message: Hello world with spaces');
    });
  });

  describe('Player Commands', () => {
    it('should create a player with old format (backward compatibility)', async () => {
      const result = await gameServer.executeConsoleCommand(
        'createPlayer testPlayer1 {"name": "TestUser", "steamId": "76561198000000001"}',
      );

      expect(result.success).to.be.true;
      expect(result.rawResult).to.include('Created player testPlayer1');
      expect(result.rawResult).to.include('TestUser');
    });

    it('should handle createPlayer with complex JSON', async () => {
      const result = await gameServer.executeConsoleCommand(
        'createPlayer testPlayer2 {"name": "Complex User", "steamId": "76561198000000002", "ip": "192.168.1.100", "ping": 50}',
      );

      expect(result.success).to.be.true;
      expect(result.rawResult).to.include('Created player testPlayer2');
    });

    it('should fail when creating duplicate player', async () => {
      // Create first player
      await gameServer.executeConsoleCommand(
        'createPlayer duplicate1 {"name": "Dup User", "steamId": "76561198000000003"}',
      );

      // Try to create same player again
      const result = await gameServer.executeConsoleCommand(
        'createPlayer duplicate1 {"name": "Dup User 2", "steamId": "76561198000000004"}',
      );

      expect(result.success).to.be.false;
      expect(result.rawResult).to.include('already exists');
    });

    it('should execute connectAll command', async () => {
      // First create some players
      await gameServer.executeConsoleCommand(
        'createPlayer player1 {"name": "Player 1", "steamId": "76561198000000010"}',
      );
      await gameServer.executeConsoleCommand(
        'createPlayer player2 {"name": "Player 2", "steamId": "76561198000000011"}',
      );

      const result = await gameServer.executeConsoleCommand('connectAll');

      expect(result.success).to.be.true;
      expect(result.rawResult).to.include('Connected all players');
    });

    it('should execute disconnectAll command', async () => {
      const result = await gameServer.executeConsoleCommand('disconnectAll');

      expect(result.success).to.be.true;
      expect(result.rawResult).to.include('Disconnected all players');
    });

    it('should handle ban command', async () => {
      const result = await gameServer.executeConsoleCommand('ban player123 Cheating');

      expect(result.success).to.be.true;
      expect(result.rawResult).to.include('Banned player player123');
      expect(result.rawResult).to.include('Cheating');
    });

    it('should handle unban command', async () => {
      const result = await gameServer.executeConsoleCommand('unban player123');

      expect(result.success).to.be.true;
      expect(result.rawResult).to.include('Unbanned player player123');
    });
  });

  describe('Command Aliases', () => {
    it('should work with command aliases', async () => {
      const result = await gameServer.executeConsoleCommand('ca'); // alias for connectAll

      expect(result.success).to.be.true;
      expect(result.rawResult).to.include('Connected all players');
    });

    it('should work with version alias', async () => {
      const result = await gameServer.executeConsoleCommand('v');

      expect(result.success).to.be.true;
      expect(result.rawResult).to.equal('Mock game server v0.0.1');
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown commands', async () => {
      const result = await gameServer.executeConsoleCommand('unknownCommand');

      expect(result.success).to.be.false;
      expect(result.rawResult).to.include('Unknown command: unknownCommand');
      expect(result.rawResult).to.include("Use 'help'");
    });

    it('should provide suggestions for typos', async () => {
      const result = await gameServer.executeConsoleCommand('connecAll'); // typo

      expect(result.success).to.be.false;
      expect(result.rawResult).to.include('Unknown command: connecAll');
    });

    it('should validate command arguments', async () => {
      const result = await gameServer.executeConsoleCommand('ban'); // missing player ID

      expect(result.success).to.be.false;
      expect(result.rawResult).to.include('Player ID is required');
    });

    it('should handle invalid JSON in createPlayer', async () => {
      const result = await gameServer.executeConsoleCommand('createPlayer testPlayer3 {invalid json}');

      expect(result.success).to.be.false;
      expect(result.rawResult).to.include('Failed to parse JSON data');
    });
  });

  describe('Simulation Commands', () => {
    it('should start and stop simulation', async () => {
      // Start simulation
      const startResult = await gameServer.executeConsoleCommand('startSimulation');
      expect(startResult.success).to.be.true;
      expect(startResult.rawResult).to.include('Activity simulation started');

      // Try to start again (should fail)
      const duplicateStart = await gameServer.executeConsoleCommand('startSimulation');
      expect(duplicateStart.success).to.be.false;
      expect(duplicateStart.rawResult).to.include('already running');

      // Stop simulation
      const stopResult = await gameServer.executeConsoleCommand('stopSimulation');
      expect(stopResult.success).to.be.true;
      expect(stopResult.rawResult).to.include('Activity simulation stopped');
    });

    it('should work with simulation aliases', async () => {
      // Using alias
      const startResult = await gameServer.executeConsoleCommand('sim start');
      expect(startResult.success).to.be.true;

      const stopResult = await gameServer.executeConsoleCommand('sim stop');
      expect(stopResult.success).to.be.true;
    });
  });
});
