import { Redis, RedisClient } from '@takaro/db';
import { IGamePlayer } from '@takaro/modules';
import { BanDTO, IPlayerReferenceDTO } from '@takaro/gameserver';
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
}
