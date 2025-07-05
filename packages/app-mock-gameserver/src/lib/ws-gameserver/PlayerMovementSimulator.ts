import { IPosition } from '@takaro/modules';
import { logger } from '@takaro/util';
import { GameDataHandler } from './DataHandler.js';

interface MapBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export class PlayerMovementSimulator {
  private log = logger('PlayerMovementSimulator');
  private dataHandler: GameDataHandler;

  // Default map boundaries based on mockserver configuration
  private static readonly DEFAULT_BOUNDS: MapBounds = {
    minX: -1000,
    maxX: 1000,
    minY: 0,
    maxY: 512,
    minZ: -1000,
    maxZ: 1000,
  };

  // Walking speed in blocks per second (realistic Minecraft speed)
  private static readonly WALKING_SPEED = 4.3;

  // Time between position updates (used for calculating movement distance)
  private static readonly UPDATE_INTERVAL_SECONDS = 10;

  constructor(dataHandler: GameDataHandler) {
    this.dataHandler = dataHandler;
  }

  /**
   * Update positions for all online players
   */
  async updateAllPlayerPositions(): Promise<void> {
    try {
      const players = await this.dataHandler.getOnlinePlayers();

      if (players.length === 0) {
        this.log.debug('No online players to move');
        return;
      }

      const updatePromises = players.map(async (playerData) => {
        try {
          const currentPosition = this.extractPosition(playerData.meta);
          if (!currentPosition) {
            this.log.warn(`No valid position for player ${playerData.player.gameId}, skipping movement`);
            return;
          }

          const newPosition = this.calculateNextPosition(currentPosition);
          await this.dataHandler.updatePlayerPosition(playerData.player.gameId, newPosition);

          this.log.debug(`Updated position for player ${playerData.player.name}`, {
            from: currentPosition,
            to: newPosition,
          });
        } catch (error) {
          this.log.error(`Failed to update position for player ${playerData.player.gameId}:`, error);
        }
      });

      await Promise.all(updatePromises);
      this.log.debug(`Updated positions for ${players.length} players`);
    } catch (error) {
      this.log.error('Error updating player positions:', error);
    }
  }

  /**
   * Calculate the next position for a player based on realistic movement
   */
  calculateNextPosition(currentPosition: IPosition, bounds?: MapBounds): IPosition {
    const mapBounds = bounds || PlayerMovementSimulator.DEFAULT_BOUNDS;

    // Calculate maximum movement distance based on walking speed and time
    const maxMovement = PlayerMovementSimulator.WALKING_SPEED * PlayerMovementSimulator.UPDATE_INTERVAL_SECONDS;

    // Generate random movement within realistic bounds
    // Players don't always move at maximum speed - add some variation
    const speedMultiplier = 0.2 + Math.random() * 0.8; // 20-100% of max speed
    const actualMaxMovement = maxMovement * speedMultiplier;

    // Random direction with realistic distance
    const deltaX = (Math.random() - 0.5) * 2 * actualMaxMovement;
    const deltaZ = (Math.random() - 0.5) * 2 * actualMaxMovement;

    // Calculate new position
    let newX = currentPosition.x + deltaX;
    let newZ = currentPosition.z + deltaZ;

    // Enforce map boundaries
    newX = this.clampToBounds(newX, mapBounds.minX, mapBounds.maxX);
    newZ = this.clampToBounds(newZ, mapBounds.minZ, mapBounds.maxZ);

    // Keep Y relatively stable (players don't fly around randomly)
    // Occasionally adjust Y within a small range to simulate terrain changes
    let newY = currentPosition.y;
    if (Math.random() < 0.3) {
      // 30% chance to change Y
      const deltaY = (Math.random() - 0.5) * 10; // +/- 5 blocks
      newY = this.clampToBounds(currentPosition.y + deltaY, mapBounds.minY, mapBounds.maxY);
    }

    return new IPosition({
      x: Math.round(newX * 10) / 10, // Round to 1 decimal place
      y: Math.round(newY * 10) / 10,
      z: Math.round(newZ * 10) / 10,
      dimension: currentPosition.dimension || 'overworld',
    });
  }

  /**
   * Generate a random position within map bounds
   */
  generateRandomPosition(bounds?: MapBounds): IPosition {
    const mapBounds = bounds || PlayerMovementSimulator.DEFAULT_BOUNDS;

    return new IPosition({
      x: this.randomBetween(mapBounds.minX, mapBounds.maxX),
      y: this.randomBetween(mapBounds.minY, mapBounds.maxY),
      z: this.randomBetween(mapBounds.minZ, mapBounds.maxZ),
      dimension: 'overworld',
    });
  }

  /**
   * Check if a position is within the specified bounds
   */
  isWithinBounds(position: IPosition, bounds?: MapBounds): boolean {
    const mapBounds = bounds || PlayerMovementSimulator.DEFAULT_BOUNDS;

    return (
      position.x >= mapBounds.minX &&
      position.x <= mapBounds.maxX &&
      position.y >= mapBounds.minY &&
      position.y <= mapBounds.maxY &&
      position.z >= mapBounds.minZ &&
      position.z <= mapBounds.maxZ
    );
  }

  /**
   * Clamp a position to the specified bounds
   */
  clampPositionToBounds(position: IPosition, bounds?: MapBounds): IPosition {
    const mapBounds = bounds || PlayerMovementSimulator.DEFAULT_BOUNDS;

    return new IPosition({
      x: this.clampToBounds(position.x, mapBounds.minX, mapBounds.maxX),
      y: this.clampToBounds(position.y, mapBounds.minY, mapBounds.maxY),
      z: this.clampToBounds(position.z, mapBounds.minZ, mapBounds.maxZ),
      dimension: position.dimension,
    });
  }

  /**
   * Calculate distance between two positions
   */
  calculateDistance(pos1: IPosition, pos2: IPosition): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const dz = pos2.z - pos1.z;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Check if movement from one position to another is realistic
   */
  isRealisticMovement(from: IPosition, to: IPosition, timeElapsedSeconds: number): boolean {
    const distance = this.calculateDistance(from, to);
    const maxPossibleDistance = PlayerMovementSimulator.WALKING_SPEED * timeElapsedSeconds;

    // Allow for some margin (150% of max speed to account for sprinting/riding)
    return distance <= maxPossibleDistance * 1.5;
  }

  /**
   * Extract position from player metadata
   */
  private extractPosition(meta: any): IPosition | null {
    try {
      const position = meta?.position;
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
      this.log.warn('Failed to extract position from meta:', error);
    }
    return null;
  }

  /**
   * Clamp a value between min and max bounds
   */
  private clampToBounds(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Generate a random number between min and max
   */
  private randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
