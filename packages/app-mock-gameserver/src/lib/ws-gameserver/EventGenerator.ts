import {
  EventChatMessage,
  EventPlayerConnected,
  EventPlayerDisconnected,
  EventPlayerDeath,
  EventEntityKilled,
  EventLogLine,
  GameEvents,
  IGamePlayer,
  IPosition,
  ChatChannel,
} from '@takaro/modules';
import { logger } from '@takaro/util';

interface ConnectionEventResult {
  type: string;
  data: EventPlayerConnected | EventPlayerDisconnected;
}

export class EventGenerator {
  private log = logger('EventGenerator');

  // Predefined content arrays
  private static readonly CHAT_MESSAGES = [
    'Hello everyone!',
    'Anyone want to team up?',
    'Great game so far',
    'Where is everyone?',
    'Found some good loot',
    'Heading to the base',
    'Anyone need help?',
    'This area looks dangerous',
    'Nice weather today',
    'Anyone seen any zombies?',
    "Let's build something together",
    'I need some resources',
    'Check out this cool location',
    'Thanks for the help!',
  ];

  private static readonly ENTITIES = [
    'zombie',
    'skeleton',
    'spider',
    'creeper',
    'wolf',
    'bear',
    'deer',
    'rabbit',
    'pig',
    'cow',
    'chicken',
    'sheep',
    'witch',
    'enderman',
    'slime',
    'bat',
  ];

  private static readonly WEAPONS = [
    'sword',
    'bow',
    'rifle',
    'pistol',
    'axe',
    'spear',
    'crossbow',
    'knife',
    'club',
    'hammer',
    'mace',
    'dagger',
    'shotgun',
    'sniper',
    'machete',
    'staff',
  ];

  private static readonly ITEMS = [
    'wood',
    'stone',
    'iron ore',
    'gold nugget',
    'apple',
    'bread',
    'water bottle',
    'bandage',
    'coal',
    'diamond',
    'emerald',
    'ruby',
    'rope',
    'torch',
    'lantern',
    'map',
  ];

  private static readonly ACTIONS = [
    'picked up',
    'dropped',
    'crafted',
    'found',
    'collected',
    'discovered',
    'obtained',
    'acquired',
  ];

  /**
   * Generate a random chat message event
   */
  generateChatMessage(players: Array<{ player: IGamePlayer; meta: any }>): EventChatMessage {
    const randomPlayer = this.getRandomPlayer(players);
    const message = this.getRandomElement(EventGenerator.CHAT_MESSAGES);
    const channel = this.getRandomChatChannel();

    return new EventChatMessage({
      player: randomPlayer.player,
      msg: message,
      channel,
      type: GameEvents.CHAT_MESSAGE,
    });
  }

  /**
   * Generate a random connection/disconnection event
   */
  generateConnectionEvent(players: Array<{ player: IGamePlayer; meta: any }>): ConnectionEventResult {
    const randomPlayer = this.getRandomPlayer(players);
    const isConnection = Math.random() > 0.5;

    if (isConnection) {
      const event = new EventPlayerConnected({
        player: randomPlayer.player,
        msg: `${randomPlayer.player.name} joined the game`,
        type: GameEvents.PLAYER_CONNECTED,
      });
      return { type: 'player-connected', data: event };
    } else {
      const event = new EventPlayerDisconnected({
        player: randomPlayer.player,
        msg: `${randomPlayer.player.name} left the game`,
        type: GameEvents.PLAYER_DISCONNECTED,
      });
      return { type: 'player-disconnected', data: event };
    }
  }

  /**
   * Generate a random player death event
   */
  generatePlayerDeath(players: Array<{ player: IGamePlayer; meta: any }>): EventPlayerDeath {
    const victim = this.getRandomPlayer(players);
    const hasAttacker = Math.random() > 0.4; // 60% chance of having an attacker
    const attacker =
      hasAttacker && players.length > 1
        ? this.getRandomPlayer(players.filter((p) => p.player.gameId !== victim.player.gameId))
        : undefined;

    const position = this.getPlayerPosition(victim);

    let message: string;
    if (attacker) {
      message = `${victim.player.name} was killed by ${attacker.player.name}`;
    } else {
      const causes = ['fell to their death', 'drowned', 'burned in lava', 'was eaten by zombies', 'died of hunger'];
      const cause = this.getRandomElement(causes);
      message = `${victim.player.name} ${cause}`;
    }

    return new EventPlayerDeath({
      player: victim.player,
      attacker: attacker?.player,
      position,
      msg: message,
      type: GameEvents.PLAYER_DEATH,
    });
  }

  /**
   * Generate a random entity kill event
   */
  generateEntityKill(players: Array<{ player: IGamePlayer; meta: any }>): EventEntityKilled {
    const killer = this.getRandomPlayer(players);
    const entity = this.getRandomElement(EventGenerator.ENTITIES);
    const weapon = this.getRandomElement(EventGenerator.WEAPONS);

    return new EventEntityKilled({
      player: killer.player,
      entity,
      weapon,
      msg: `${killer.player.name} killed a ${entity} with ${weapon}`,
      type: GameEvents.ENTITY_KILLED,
    });
  }

  /**
   * Generate a random item interaction log event
   */
  generateItemInteraction(players: Array<{ player: IGamePlayer; meta: any }>): EventLogLine {
    const player = this.getRandomPlayer(players);
    const item = this.getRandomElement(EventGenerator.ITEMS);
    const action = this.getRandomElement(EventGenerator.ACTIONS);
    const quantity = Math.floor(Math.random() * 10) + 1;

    const message = `${player.player.name} ${action} ${quantity}x ${item}`;

    return new EventLogLine({
      msg: message,
      type: GameEvents.LOG_LINE,
    });
  }

  /**
   * Get a random element from an array
   */
  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Get a random player from the players array
   */
  private getRandomPlayer(players: Array<{ player: IGamePlayer; meta: any }>): { player: IGamePlayer; meta: any } {
    if (players.length === 0) {
      throw new Error('No players available for event generation');
    }
    return this.getRandomElement(players);
  }

  /**
   * Get a random chat channel
   */
  private getRandomChatChannel(): ChatChannel {
    const channels = Object.values(ChatChannel);
    // Weight towards GLOBAL channel (70% chance)
    const weights = [0.7, 0.1, 0.1, 0.1]; // GLOBAL, TEAM, FRIENDS, WHISPER
    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random < cumulative) {
        return channels[i];
      }
    }

    return ChatChannel.GLOBAL; // Fallback
  }

  /**
   * Extract position from player meta data
   */
  private getPlayerPosition(playerData: { player: IGamePlayer; meta: any }): IPosition | undefined {
    try {
      const position = playerData.meta?.position;
      if (
        position &&
        typeof position.x === 'number' &&
        typeof position.y === 'number' &&
        typeof position.z === 'number'
      ) {
        return new IPosition({
          x: position.x,
          y: position.y,
          z: position.z,
          dimension: position.dimension || 'overworld',
        });
      }
    } catch (error) {
      this.log.warn('Failed to extract player position:', error);
    }
    return undefined;
  }
}
