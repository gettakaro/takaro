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
import { GameDataHandler } from './DataHandler.js';
import { CHAT_MESSAGES, WEAPONS, ACTIONS } from './EventContent.js';
import { getItemCodes, getEntityCodes } from './GameContent.js';

interface ConnectionEventResult {
  type: string;
  data: EventPlayerConnected | EventPlayerDisconnected;
}

export class EventGenerator {
  private log = logger('EventGenerator');
  private dataHandler?: GameDataHandler;

  constructor(dataHandler?: GameDataHandler) {
    this.dataHandler = dataHandler;
  }

  // Utility methods

  /**
   * Generate a random chat message event
   */
  generateChatMessage(players: Array<{ player: IGamePlayer; meta: any }>): EventChatMessage {
    const randomPlayer = this.getRandomPlayer(players);
    const message = this.getRandomElement(CHAT_MESSAGES);
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
  generateConnectionEvent(
    players: Array<{ player: IGamePlayer; meta: any }>,
    biasTowardConnection?: boolean,
  ): ConnectionEventResult {
    // Filter players by online status
    const onlinePlayers = players.filter((p) => p.meta.online);
    const offlinePlayers = players.filter((p) => !p.meta.online);

    this.log.debug('Connection event generation', {
      totalPlayers: players.length,
      onlinePlayers: onlinePlayers.length,
      offlinePlayers: offlinePlayers.length,
      biasTowardConnection,
    });

    // Determine what action to take based on available players
    let shouldConnect: boolean;
    let availablePlayers: Array<{ player: IGamePlayer; meta: any }>;

    if (offlinePlayers.length === 0 && onlinePlayers.length > 0) {
      // Only online players available, must disconnect someone
      shouldConnect = false;
      availablePlayers = onlinePlayers;
    } else if (onlinePlayers.length === 0 && offlinePlayers.length > 0) {
      // Only offline players available, must connect someone
      shouldConnect = true;
      availablePlayers = offlinePlayers;
    } else if (offlinePlayers.length > 0 && onlinePlayers.length > 0) {
      // Both types available - use population bias if provided, otherwise default logic
      if (biasTowardConnection !== undefined) {
        shouldConnect = biasTowardConnection;
        availablePlayers = shouldConnect ? offlinePlayers : onlinePlayers;
      } else {
        // Default: prefer connecting offline players (70% chance)
        shouldConnect = Math.random() > 0.3;
        availablePlayers = shouldConnect ? offlinePlayers : onlinePlayers;
      }
    } else {
      // No players available (shouldn't happen)
      throw new Error('No players available for connection event generation');
    }

    const selectedPlayer = this.getRandomElement(availablePlayers);

    if (shouldConnect) {
      const event = new EventPlayerConnected({
        player: selectedPlayer.player,
        msg: `${selectedPlayer.player.name} joined the game`,
        type: GameEvents.PLAYER_CONNECTED,
      });
      return { type: 'player-connected', data: event };
    } else {
      const event = new EventPlayerDisconnected({
        player: selectedPlayer.player,
        msg: `${selectedPlayer.player.name} left the game`,
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
    const entity = this.getRandomElement(getEntityCodes());
    const weapon = this.getRandomElement(WEAPONS);

    return new EventEntityKilled({
      player: killer.player,
      entity,
      weapon,
      msg: `${killer.player.name} killed a ${entity} with ${weapon}`,
      type: GameEvents.ENTITY_KILLED,
    });
  }

  /**
   * Generate a random item interaction log event and apply inventory changes
   */
  async generateItemInteraction(players: Array<{ player: IGamePlayer; meta: any }>): Promise<EventLogLine> {
    const player = this.getRandomPlayer(players);
    const item = this.getRandomElement(getItemCodes());
    const action = this.getRandomElement(ACTIONS);
    const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 items for more reasonable quantities

    let message: string;

    if (this.dataHandler) {
      try {
        if (action === 'picked up') {
          // Add item to inventory
          await this.dataHandler.addItemToInventory(player.player.gameId, item, quantity);
          message = `${player.player.name} ${action} ${quantity}x ${item}`;
        } else if (action === 'dropped') {
          // Try to remove item from inventory
          const success = await this.dataHandler.removeItemFromInventory(player.player.gameId, item, quantity);
          if (success) {
            message = `${player.player.name} ${action} ${quantity}x ${item}`;
          } else {
            // Fallback to pickup if they don't have the item
            await this.dataHandler.addItemToInventory(player.player.gameId, item, quantity);
            message = `${player.player.name} picked up ${quantity}x ${item}`;
          }
        } else {
          message = `${player.player.name} ${action} ${quantity}x ${item}`;
        }
      } catch (error) {
        this.log.error('Error applying inventory changes:', error);
        message = `${player.player.name} ${action} ${quantity}x ${item} (inventory update failed)`;
      }
    } else {
      // Fallback when no data handler available
      message = `${player.player.name} ${action} ${quantity}x ${item}`;
    }

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
