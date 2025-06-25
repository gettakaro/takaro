import { Redis, RedisClient } from '@takaro/db';
import { IGamePlayer } from '@takaro/modules';
import { BanDTO, IPlayerReferenceDTO, IItemDTO } from '@takaro/gameserver';
import { errors, logger } from '@takaro/util';

export interface IPlayerMeta {
  position: {
    x: number;
    y: number;
    z: number;
    dimension?: string;
  };
  online: boolean;
}

export interface IInventoryItem {
  code: string;
  name: string;
  description: string;
  quantity: number;
}

export class GameDataHandler {
  private redis: RedisClient;
  private log = logger('GameDataHandler');
  private readonly keyPrefix: string;

  constructor(private readonly serverId: string) {
    this.keyPrefix = `gameserver:${serverId}`;
  }

  async init(): Promise<void> {
    this.redis = await Redis.getClient(`gameserver-${this.serverId}`);
    this.log.info('Initialized GameDataHandler');
  }

  private getPlayerKey(gameId: string): string {
    if (!gameId) throw new errors.BadRequestError('gameId is required');
    return `${this.keyPrefix}:player:${gameId}`;
  }

  private getPlayerMetaKey(gameId: string): string {
    if (!gameId) throw new errors.BadRequestError('gameId is required');
    return `${this.keyPrefix}:player:${gameId}:meta`;
  }

  private getPlayersSetKey(): string {
    return `${this.keyPrefix}:players`;
  }

  private getBanKey(gameId: string): string {
    if (!gameId) throw new errors.BadRequestError('gameId is required');
    return `${this.keyPrefix}:ban:${gameId}`;
  }

  private getPlayerInventoryKey(gameId: string): string {
    if (!gameId) throw new errors.BadRequestError('gameId is required');
    return `${this.keyPrefix}:player:${gameId}:inventory`;
  }

  async addPlayer(player: IGamePlayer, meta: IPlayerMeta): Promise<void> {
    const playerKey = this.getPlayerKey(player.gameId);
    const metaKey = this.getPlayerMetaKey(player.gameId);

    const playerFields: Record<string, string> = {
      gameId: player.gameId,
      name: player.name,
    };

    // Include optional fields only if they exist
    if (player.epicOnlineServicesId) playerFields.epicOnlineServicesId = player.epicOnlineServicesId;
    if (player.steamId) playerFields.steamId = player.steamId;
    if (player.xboxLiveId) playerFields.xboxLiveId = player.xboxLiveId;
    if (player.platformId) playerFields.platformId = player.platformId;
    if (player.ip) playerFields.ip = player.ip;
    if (player.ping !== undefined) playerFields.ping = player.ping.toString();

    const metaFields: Record<string, string> = {
      'position.x': meta.position.x.toString(),
      'position.y': meta.position.y.toString(),
      'position.z': meta.position.z.toString(),
      online: meta.online.toString(),
    };

    if (meta.position.dimension) {
      metaFields['position.dimension'] = meta.position.dimension;
    }

    const multi = this.redis.multi();
    multi.hSet(playerKey, playerFields);
    multi.hSet(metaKey, metaFields);
    multi.sAdd(this.getPlayersSetKey(), player.gameId);

    await multi.exec();
  }

  async getPlayer(playerRef: IPlayerReferenceDTO): Promise<{ player: IGamePlayer; meta: IPlayerMeta } | null> {
    const playerKey = this.getPlayerKey(playerRef.gameId);
    const metaKey = this.getPlayerMetaKey(playerRef.gameId);

    try {
      const [playerData, metaData] = await Promise.all([this.redis.hGetAll(playerKey), this.redis.hGetAll(metaKey)]);

      if (
        !playerData?.gameId ||
        !playerData?.name ||
        !metaData['position.x'] ||
        !metaData['position.y'] ||
        !metaData['position.z']
      ) {
        this.log.warn(`Player ${playerRef.gameId} data incomplete, removing from index`);
        await this.removePlayer(playerRef.gameId); // Cleanup orphaned data
        return null;
      }

      const x = parseInt(metaData['position.x'], 10);
      const y = parseInt(metaData['position.y'], 10);
      const z = parseInt(metaData['position.z'], 10);

      const online = metaData.online === 'true';

      if (isNaN(x) || isNaN(y) || isNaN(z)) {
        this.log.error(`Invalid position data for player ${playerRef.gameId}`);
        return null;
      }

      return {
        player: new IGamePlayer({
          gameId: playerData.gameId,
          name: playerData.name,
          epicOnlineServicesId: playerData.epicOnlineServicesId || undefined,
          steamId: playerData.steamId || undefined,
          xboxLiveId: playerData.xboxLiveId || undefined,
          platformId: playerData.platformId || undefined,
          ip: playerData.ip || undefined,
          ping: playerData.ping ? parseInt(playerData.ping, 10) : undefined,
        }),
        meta: {
          position: {
            x,
            y,
            z,
            dimension: metaData['position.dimension'] || undefined,
          },
          online,
        },
      };
    } catch (error) {
      this.log.error(`Error retrieving player ${playerRef.gameId}: ${error}`);
      return null;
    }
  }

  async getAllPlayers(): Promise<Array<{ player: IGamePlayer; meta: IPlayerMeta }>> {
    try {
      const gameIds = await this.redis.sMembers(this.getPlayersSetKey());
      const players = await Promise.all(gameIds.map((gameId) => this.getPlayer(new IPlayerReferenceDTO({ gameId }))));
      return players.filter((player): player is { player: IGamePlayer; meta: IPlayerMeta } => !!player);
    } catch (error) {
      this.log.error(`Error retrieving all players: ${error}`);
      return [];
    }
  }

  async getOnlinePlayers(): Promise<Array<{ player: IGamePlayer; meta: IPlayerMeta }>> {
    const allPlayers = await this.getAllPlayers();
    return allPlayers.filter((player) => player.meta.online);
  }

  async updatePlayerPosition(
    gameId: string,
    position: { x: number; y: number; z: number; dimension?: string },
  ): Promise<void> {
    const metaKey = this.getPlayerMetaKey(gameId);
    try {
      const fields: Record<string, string> = {
        'position.x': position.x.toString(),
        'position.y': position.y.toString(),
        'position.z': position.z.toString(),
      };

      if (position.dimension !== undefined) {
        fields['position.dimension'] = position.dimension;
      }

      await this.redis.hSet(metaKey, fields);
    } catch (error) {
      this.log.error(`Error updating position for player ${gameId}: ${error}`);
      throw error;
    }
  }

  async setOnlineStatus(gameId: string, online: boolean): Promise<void> {
    const metaKey = this.getPlayerMetaKey(gameId);
    try {
      await this.redis.hSet(metaKey, {
        online: online.toString(),
      });
    } catch (error) {
      this.log.error(`Error updating online status for player ${gameId}: ${error}`);
      throw error;
    }
  }

  async updatePlayerData(
    gameId: string,
    updates: {
      // Player fields
      name?: string;
      steamId?: string;
      epicOnlineServicesId?: string;
      xboxLiveId?: string;
      platformId?: string;
      ip?: string;
      ping?: number;
      // Meta fields
      position?: { x: number; y: number; z: number; dimension?: string };
      online?: boolean;
    },
  ): Promise<void> {
    // Validate player exists
    const player = await this.getPlayer(new IPlayerReferenceDTO({ gameId }));
    if (!player) {
      throw new errors.NotFoundError(`Player ${gameId} not found`);
    }

    const multi = this.redis.multi();

    // Update player fields if provided
    const playerFields: Record<string, string> = {};
    if (updates.name !== undefined) playerFields.name = updates.name;
    if (updates.steamId !== undefined) playerFields.steamId = updates.steamId;
    if (updates.epicOnlineServicesId !== undefined) playerFields.epicOnlineServicesId = updates.epicOnlineServicesId;
    if (updates.xboxLiveId !== undefined) playerFields.xboxLiveId = updates.xboxLiveId;
    if (updates.platformId !== undefined) playerFields.platformId = updates.platformId;
    if (updates.ip !== undefined) playerFields.ip = updates.ip;
    if (updates.ping !== undefined) playerFields.ping = updates.ping.toString();

    if (Object.keys(playerFields).length > 0) {
      const playerKey = this.getPlayerKey(gameId);
      multi.hSet(playerKey, playerFields);
    }

    // Update meta fields if provided
    const metaFields: Record<string, string> = {};
    if (updates.position !== undefined) {
      metaFields['position.x'] = updates.position.x.toString();
      metaFields['position.y'] = updates.position.y.toString();
      metaFields['position.z'] = updates.position.z.toString();
      if (updates.position.dimension !== undefined) {
        metaFields['position.dimension'] = updates.position.dimension;
      }
    }
    if (updates.online !== undefined) {
      metaFields.online = updates.online.toString();
    }

    if (Object.keys(metaFields).length > 0) {
      const metaKey = this.getPlayerMetaKey(gameId);
      multi.hSet(metaKey, metaFields);
    }

    try {
      await multi.exec();
      this.log.info(`Updated player ${gameId} data:`, updates);
    } catch (error) {
      this.log.error(`Error updating player ${gameId} data:`, error);
      throw error;
    }
  }

  async removePlayer(gameId: string): Promise<void> {
    const playerKey = this.getPlayerKey(gameId);
    const metaKey = this.getPlayerMetaKey(gameId);

    const multi = this.redis.multi();
    multi.del(playerKey);
    multi.del(metaKey);
    multi.sRem(this.getPlayersSetKey(), gameId);

    try {
      await multi.exec();
    } catch (error) {
      this.log.error(`Error removing player ${gameId}: ${error}`);
      throw error;
    }
  }

  async banPlayer(options: BanDTO): Promise<void> {
    const player = await this.getPlayer(options.player);
    if (!player) {
      throw new errors.NotFoundError('Player not found');
    }

    const banKey = this.getBanKey(options.player.gameId);

    try {
      // Store the ban information
      if (options.expiresAt) {
        // Calculate the expiration timestamp if expiresAt is provided
        const expireTimestamp = new Date(options.expiresAt).valueOf();

        await this.redis.set(banKey, JSON.stringify(options), {
          EXAT: Math.floor(expireTimestamp / 1000), // Redis expects seconds, not milliseconds
        });
      } else {
        // Permanent ban without expiration
        await this.redis.set(banKey, JSON.stringify(options));
      }
    } catch (error) {
      this.log.error(`Error banning player ${options.player.gameId}: ${error}`);
      throw error;
    }
  }

  async unbanPlayer(playerRef: IPlayerReferenceDTO): Promise<void> {
    const player = await this.getPlayer(playerRef);
    if (!player) {
      throw new errors.NotFoundError('Player not found');
    }

    const banKey = this.getBanKey(playerRef.gameId);

    try {
      await this.redis.del(banKey);
    } catch (error) {
      this.log.error(`Error unbanning player ${playerRef.gameId}: ${error}`);
      throw error;
    }
  }

  async listBans(): Promise<BanDTO[]> {
    try {
      // Get all ban keys
      const banPattern = this.getBanKey('*');
      const keys = await this.redis.keys(banPattern);

      if (!keys.length) return [];

      // Get all ban data
      const banData = await this.redis.mGet(keys);

      // Parse and process ban data
      const banDTOs = await Promise.all(
        banData.map(async (banJson) => {
          if (!banJson) return null;
          const parsedBan = JSON.parse(banJson);
          try {
            const banDto = new BanDTO({ ...parsedBan });

            // Fetch the associated player data
            const player = await this.getPlayer(banDto.player);
            if (!player) return null;

            // Return the ban with updated player information
            return {
              ...banDto,
              player: player.player,
            } as BanDTO;
          } catch (error) {
            this.log.error(`Error parsing ban data: ${error}`);
            return null;
          }
        }),
      );

      // Filter out any nulls and return valid bans
      return banDTOs.filter((ban): ban is BanDTO => ban !== null);
    } catch (error) {
      this.log.error(`Error listing bans: ${error}`);
      return [];
    }
  }

  private getSimulationStateKey(): string {
    return `${this.keyPrefix}:simulation:state`;
  }

  private getSimulationConfigKey(): string {
    return `${this.keyPrefix}:simulation:config`;
  }

  async getSimulationState(): Promise<{ isRunning: boolean; config: any } | null> {
    try {
      const [stateJson, configJson] = await this.redis.mGet([
        this.getSimulationStateKey(),
        this.getSimulationConfigKey(),
      ]);

      if (!stateJson) return null;

      return {
        isRunning: JSON.parse(stateJson).isRunning,
        config: configJson ? JSON.parse(configJson) : null,
      };
    } catch (error) {
      this.log.error(`Error getting simulation state: ${error}`);
      return null;
    }
  }

  async setSimulationState(isRunning: boolean): Promise<void> {
    try {
      await this.redis.set(
        this.getSimulationStateKey(),
        JSON.stringify({ isRunning, timestamp: new Date().toISOString() }),
      );
    } catch (error) {
      this.log.error(`Error setting simulation state: ${error}`);
      throw error;
    }
  }

  async setSimulationConfig(config: any): Promise<void> {
    try {
      await this.redis.set(this.getSimulationConfigKey(), JSON.stringify(config));
    } catch (error) {
      this.log.error(`Error setting simulation config: ${error}`);
      throw error;
    }
  }

  // Inventory Management Methods

  async getPlayerInventory(gameId: string): Promise<IItemDTO[]> {
    try {
      const inventoryKey = this.getPlayerInventoryKey(gameId);
      const inventoryJson = await this.redis.get(inventoryKey);

      if (!inventoryJson) {
        this.log.debug(`No inventory found for player ${gameId}, initializing default inventory`);
        await this.initializePlayerInventory(gameId);
        return this.getDefaultInventory();
      }

      const inventoryItems: IInventoryItem[] = JSON.parse(inventoryJson);
      return inventoryItems.map(
        (item) =>
          new IItemDTO({
            code: item.code,
            name: item.name,
            description: item.description,
          }),
      );
    } catch (error) {
      this.log.error(`Error getting inventory for player ${gameId}: ${error}`);
      return [];
    }
  }

  async setPlayerInventory(gameId: string, items: IInventoryItem[]): Promise<void> {
    try {
      const inventoryKey = this.getPlayerInventoryKey(gameId);
      await this.redis.set(inventoryKey, JSON.stringify(items));
      this.log.debug(`Set inventory for player ${gameId}`, { itemCount: items.length });
    } catch (error) {
      this.log.error(`Error setting inventory for player ${gameId}: ${error}`);
      throw error;
    }
  }

  async addItemToInventory(gameId: string, itemCode: string, quantity: number): Promise<void> {
    try {
      const currentInventory = await this.getPlayerInventoryRaw(gameId);
      const existingItemIndex = currentInventory.findIndex((item) => item.code === itemCode);

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        currentInventory[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        const itemInfo = this.getItemInfo(itemCode);
        currentInventory.push({
          code: itemCode,
          name: itemInfo.name,
          description: itemInfo.description,
          quantity: quantity,
        });
      }

      await this.setPlayerInventory(gameId, currentInventory);
      this.log.debug(`Added ${quantity}x ${itemCode} to player ${gameId} inventory`);
    } catch (error) {
      this.log.error(`Error adding item to inventory for player ${gameId}: ${error}`);
      throw error;
    }
  }

  async removeItemFromInventory(gameId: string, itemCode: string, quantity: number): Promise<boolean> {
    try {
      const currentInventory = await this.getPlayerInventoryRaw(gameId);
      const existingItemIndex = currentInventory.findIndex((item) => item.code === itemCode);

      if (existingItemIndex < 0) {
        this.log.warn(`Attempted to remove ${itemCode} from player ${gameId} but item not found`);
        return false;
      }

      const currentQuantity = currentInventory[existingItemIndex].quantity;
      if (currentQuantity < quantity) {
        this.log.warn(
          `Attempted to remove ${quantity}x ${itemCode} from player ${gameId} but only ${currentQuantity} available`,
        );
        return false;
      }

      // Remove or update quantity
      if (currentQuantity === quantity) {
        // Remove item completely
        currentInventory.splice(existingItemIndex, 1);
      } else {
        // Reduce quantity
        currentInventory[existingItemIndex].quantity -= quantity;
      }

      await this.setPlayerInventory(gameId, currentInventory);
      this.log.debug(`Removed ${quantity}x ${itemCode} from player ${gameId} inventory`);
      return true;
    } catch (error) {
      this.log.error(`Error removing item from inventory for player ${gameId}: ${error}`);
      return false;
    }
  }

  async initializePlayerInventory(gameId: string): Promise<void> {
    try {
      const defaultInventory = this.getDefaultInventory();
      const inventoryItems: IInventoryItem[] = defaultInventory.map((item) => ({
        code: item.code,
        name: item.name,
        description: item.description,
        quantity: 1,
      }));

      await this.setPlayerInventory(gameId, inventoryItems);
      this.log.debug(`Initialized default inventory for player ${gameId}`);
    } catch (error) {
      this.log.error(`Error initializing inventory for player ${gameId}: ${error}`);
      throw error;
    }
  }

  private async getPlayerInventoryRaw(gameId: string): Promise<IInventoryItem[]> {
    const inventoryKey = this.getPlayerInventoryKey(gameId);
    const inventoryJson = await this.redis.get(inventoryKey);

    if (!inventoryJson) {
      await this.initializePlayerInventory(gameId);
      return this.getDefaultInventoryRaw();
    }

    return JSON.parse(inventoryJson);
  }

  private getDefaultInventory(): IItemDTO[] {
    return [
      new IItemDTO({
        code: 'wood',
        name: 'Wood',
        description: 'Wood is good',
      }),
      new IItemDTO({
        code: 'stone',
        name: 'Stone',
        description: 'Stone can get you stoned',
      }),
    ];
  }

  private getDefaultInventoryRaw(): IInventoryItem[] {
    return [
      {
        code: 'wood',
        name: 'Wood',
        description: 'Wood is good',
        quantity: 1,
      },
      {
        code: 'stone',
        name: 'Stone',
        description: 'Stone can get you stoned',
        quantity: 1,
      },
    ];
  }

  private getItemInfo(itemCode: string): { name: string; description: string } {
    // Known items mapping
    const itemMap: Record<string, { name: string; description: string }> = {
      wood: { name: 'Wood', description: 'Wood is good' },
      stone: { name: 'Stone', description: 'Stone can get you stoned' },
      'iron ore': { name: 'Iron Ore', description: 'Raw iron ore' },
      'gold nugget': { name: 'Gold Nugget', description: 'Shiny gold nugget' },
      apple: { name: 'Apple', description: 'Fresh red apple' },
      bread: { name: 'Bread', description: 'Freshly baked bread' },
      'water bottle': { name: 'Water Bottle', description: 'Clean drinking water' },
      bandage: { name: 'Bandage', description: 'Medical bandage for healing' },
      coal: { name: 'Coal', description: 'Black coal for fuel' },
      diamond: { name: 'Diamond', description: 'Precious diamond' },
      emerald: { name: 'Emerald', description: 'Green emerald' },
      ruby: { name: 'Ruby', description: 'Red ruby' },
      rope: { name: 'Rope', description: 'Strong rope' },
      torch: { name: 'Torch', description: 'Light source' },
      lantern: { name: 'Lantern', description: 'Bright lantern' },
      map: { name: 'Map', description: 'Navigation map' },
    };

    return itemMap[itemCode] || { name: itemCode, description: `Unknown item: ${itemCode}` };
  }
}
