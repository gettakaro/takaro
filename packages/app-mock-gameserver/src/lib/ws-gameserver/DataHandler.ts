import { Redis, RedisClient } from '@takaro/db';
import { IGamePlayer } from '@takaro/modules';
import { IPlayerReferenceDTO } from '@takaro/gameserver';
import { errors, logger } from '@takaro/util';

export interface IPlayerMeta {
  position: {
    x: number;
    y: number;
    z: number;
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

    const metaFields = {
      'position.x': meta.position.x.toString(),
      'position.y': meta.position.y.toString(),
      'position.z': meta.position.z.toString(),
      online: meta.online.toString(),
    };

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

      if (!online) return null;

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
        }),
        meta: {
          position: { x, y, z },
          online,
        },
      };
    } catch (error) {
      this.log.error(`Error retrieving player ${playerRef.gameId}: ${error}`);
      return null;
    }
  }

  async getPlayers(): Promise<Array<{ player: IGamePlayer; meta: IPlayerMeta }>> {
    try {
      const gameIds = await this.redis.sMembers(this.getPlayersSetKey());
      const players = await Promise.all(gameIds.map((gameId) => this.getPlayer(new IPlayerReferenceDTO({ gameId }))));
      return players
        .filter((player): player is { player: IGamePlayer; meta: IPlayerMeta } => !!player)
        .filter((player) => player.meta.online);
    } catch (error) {
      this.log.error(`Error retrieving all players: ${error}`);
      return [];
    }
  }

  async updatePlayerPosition(gameId: string, position: { x: number; y: number; z: number }): Promise<void> {
    const metaKey = this.getPlayerMetaKey(gameId);
    try {
      await this.redis.hSet(metaKey, {
        'position.x': position.x.toString(),
        'position.y': position.y.toString(),
        'position.z': position.z.toString(),
      });
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
}
