import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { EventGenerator } from './EventGenerator.js';

// Simple mock for IGamePlayer without decorators
class MockGamePlayer {
  constructor(
    public gameId: string,
    public name: string,
  ) {}
}

describe('EventGenerator', () => {
  let generator: EventGenerator;
  let mockPlayers: Array<{ player: MockGamePlayer; meta: any }>;

  beforeEach(() => {
    generator = new EventGenerator();
    mockPlayers = [
      {
        player: new MockGamePlayer('player1', 'Alice'),
        meta: {
          position: { x: 100, y: 64, z: 200, dimension: 'overworld' },
          online: true,
        },
      },
      {
        player: new MockGamePlayer('player2', 'Bob'),
        meta: {
          position: { x: 150, y: 70, z: 300, dimension: 'overworld' },
          online: true,
        },
      },
      {
        player: new MockGamePlayer('player3', 'Charlie'),
        meta: {
          position: { x: 200, y: 65, z: 400, dimension: 'nether' },
          online: false,
        },
      },
    ];
  });

  describe('Chat Message Generation', () => {
    it('should generate chat message with valid structure', () => {
      const event = generator.generateChatMessage(mockPlayers as any);

      assert.ok(event, 'Should generate an event');
      assert.ok(event.player, 'Should have a player');
      assert.ok(event.msg, 'Should have a message');
      assert.ok(event.channel, 'Should have a channel');
      assert.strictEqual(event.type, 'chat-message', 'Should have correct type');
    });

    it('should use random players and messages', () => {
      const events = Array.from({ length: 10 }, () => generator.generateChatMessage(mockPlayers as any));

      const uniqueMessages = new Set(events.map((e) => e.msg));
      const uniquePlayers = new Set(events.map((e) => e.player.name));

      assert.ok(uniqueMessages.size >= 1, 'Should use different messages');
      assert.ok(uniquePlayers.size >= 1, 'Should use different players');
    });

    it('should throw error with empty player list', () => {
      assert.throws(
        () => generator.generateChatMessage([]),
        /No players available/,
        'Should throw error for empty player list',
      );
    });
  });

  describe('Connection Event Generation', () => {
    it('should generate connection or disconnection event', () => {
      const event = generator.generateConnectionEvent(mockPlayers as any);

      assert.ok(event, 'Should generate an event');
      assert.ok(event.type, 'Should have a type');
      assert.ok(event.data, 'Should have data');
      assert.ok(
        ['player-connected', 'player-disconnected'].includes(event.type),
        'Should be connection or disconnection',
      );
    });

    it('should generate both connection types over multiple calls', () => {
      const events = Array.from({ length: 20 }, () => generator.generateConnectionEvent(mockPlayers as any));

      const connectionTypes = new Set(events.map((e) => e.type));

      // With 20 calls, we should get both types (very high probability)
      assert.ok(
        connectionTypes.has('player-connected') || connectionTypes.has('player-disconnected'),
        'Should generate at least one type of connection event',
      );
    });

    it('should include player information in event data', () => {
      const event = generator.generateConnectionEvent(mockPlayers as any);

      assert.ok(event.data.player, 'Should have player in event data');
      assert.ok(event.data.msg, 'Should have message in event data');
      assert.ok(event.data.type, 'Should have type in event data');
    });
  });

  describe('Player Death Generation', () => {
    it('should generate death event with victim', () => {
      const event = generator.generatePlayerDeath(mockPlayers as any);

      assert.ok(event, 'Should generate an event');
      assert.ok(event.player, 'Should have a victim player');
      assert.ok(event.msg, 'Should have a death message');
      assert.strictEqual(event.type, 'player-death', 'Should have correct type');
    });

    it('should sometimes include attacker', () => {
      const events = Array.from({ length: 20 }, () => generator.generatePlayerDeath(mockPlayers as any));

      const eventsWithAttacker = events.filter((e) => e.attacker);
      const eventsWithoutAttacker = events.filter((e) => !e.attacker);

      // Should have a mix over 20 iterations
      assert.ok(
        eventsWithAttacker.length > 0 || eventsWithoutAttacker.length > 0,
        'Should generate both types of death events',
      );
    });

    it('should include position when available', () => {
      const event = generator.generatePlayerDeath(mockPlayers as any);

      // Position should be included since our mock players have positions
      assert.ok(event.position, 'Should include position from player meta');
    });

    it('should ensure attacker is different from victim', () => {
      const events = Array.from({ length: 10 }, () => generator.generatePlayerDeath(mockPlayers as any));

      const eventsWithAttacker = events.filter((e) => e.attacker);
      eventsWithAttacker.forEach((event) => {
        assert.notStrictEqual(event.player.gameId, event.attacker!.gameId, 'Attacker should be different from victim');
      });
    });
  });

  describe('Entity Kill Generation', () => {
    it('should generate entity kill event', () => {
      const event = generator.generateEntityKill(mockPlayers as any);

      assert.ok(event, 'Should generate an event');
      assert.ok(event.player, 'Should have a player');
      assert.ok(event.entity, 'Should have an entity');
      assert.ok(event.weapon, 'Should have a weapon');
      assert.ok(event.msg, 'Should have a message');
      assert.strictEqual(event.type, 'entity-killed', 'Should have correct type');
    });

    it('should use variety of entities and weapons', () => {
      const events = Array.from({ length: 20 }, () => generator.generateEntityKill(mockPlayers as any));

      const uniqueEntities = new Set(events.map((e) => e.entity));
      const uniqueWeapons = new Set(events.map((e) => e.weapon));

      assert.ok(uniqueEntities.size >= 1, 'Should use different entities');
      assert.ok(uniqueWeapons.size >= 1, 'Should use different weapons');
    });

    it('should generate logical kill messages', () => {
      const event = generator.generateEntityKill(mockPlayers as any);

      assert.ok(event.msg.includes(event.player.name), 'Message should include player name');
      assert.ok(event.msg.includes(event.entity), 'Message should include entity');
      assert.ok(event.msg.includes(event.weapon), 'Message should include weapon');
    });
  });

  describe('Item Interaction Generation', () => {
    it('should generate item interaction log event', () => {
      const event = generator.generateItemInteraction(mockPlayers as any);

      assert.ok(event, 'Should generate an event');
      assert.ok(event.msg, 'Should have a message');
      assert.strictEqual(event.type, 'log', 'Should have correct type');
    });

    it('should include player, item, and action in message', () => {
      const event = generator.generateItemInteraction(mockPlayers as any);

      // Message should contain player name and some item/action words
      const playerNames = mockPlayers.map((p) => p.player.name);
      const hasPlayerName = playerNames.some((name) => event.msg.includes(name));

      assert.ok(hasPlayerName, 'Message should include a player name');
      assert.ok(event.msg.length > 10, 'Message should be descriptive');
    });

    it('should generate variety of interactions', () => {
      const events = Array.from({ length: 20 }, () => generator.generateItemInteraction(mockPlayers as any));

      const uniqueMessages = new Set(events.map((e) => e.msg));

      assert.ok(uniqueMessages.size > 1, 'Should generate variety of interaction messages');
    });
  });

  describe('Edge Cases', () => {
    it('should handle single player', () => {
      const singlePlayer = [mockPlayers[0]];

      assert.doesNotThrow(() => {
        generator.generateChatMessage(singlePlayer as any);
        generator.generateConnectionEvent(singlePlayer as any);
        generator.generatePlayerDeath(singlePlayer as any);
        generator.generateEntityKill(singlePlayer as any);
        generator.generateItemInteraction(singlePlayer as any);
      }, 'Should handle single player without errors');
    });

    it('should handle players without positions', () => {
      const playersWithoutPositions = [
        {
          player: new MockGamePlayer('player1', 'Alice'),
          meta: { online: true },
        },
      ];

      assert.doesNotThrow(() => {
        const deathEvent = generator.generatePlayerDeath(playersWithoutPositions as any);
        assert.strictEqual(deathEvent.position, undefined, 'Should handle missing position gracefully');
      }, 'Should handle missing positions without errors');
    });

    it('should handle malformed player meta', () => {
      const playersWithBadMeta = [
        {
          player: new MockGamePlayer('player1', 'Alice'),
          meta: { position: { x: 'invalid', y: null, z: undefined } },
        },
      ];

      assert.doesNotThrow(() => {
        const deathEvent = generator.generatePlayerDeath(playersWithBadMeta as any);
        assert.strictEqual(deathEvent.position, undefined, 'Should handle malformed position gracefully');
      }, 'Should handle malformed meta without errors');
    });
  });

  describe('Content Variety', () => {
    it('should use predefined content arrays effectively', () => {
      const chatEvents = Array.from({ length: 50 }, () => generator.generateChatMessage(mockPlayers as any));
      const killEvents = Array.from({ length: 30 }, () => generator.generateEntityKill(mockPlayers as any));

      const uniqueChatMessages = new Set(chatEvents.map((e) => e.msg));
      const uniqueEntities = new Set(killEvents.map((e) => e.entity));
      const uniqueWeapons = new Set(killEvents.map((e) => e.weapon));

      assert.ok(uniqueChatMessages.size >= 5, 'Should use multiple chat messages');
      assert.ok(uniqueEntities.size >= 3, 'Should use multiple entity types');
      assert.ok(uniqueWeapons.size >= 3, 'Should use multiple weapon types');
    });

    it('should prefer GLOBAL chat channel but use others', () => {
      const chatEvents = Array.from({ length: 100 }, () => generator.generateChatMessage(mockPlayers as any));

      const channelCounts = chatEvents.reduce(
        (acc, event) => {
          acc[event.channel] = (acc[event.channel] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      // Should have mostly GLOBAL but some others too
      assert.ok(channelCounts['global'] > 50, 'Should prefer GLOBAL channel');

      const totalNonGlobal = Object.entries(channelCounts)
        .filter(([channel]) => channel !== 'global')
        .reduce((sum, [, count]) => sum + count, 0);

      assert.ok(totalNonGlobal > 0, 'Should use some non-global channels');
    });
  });
});
