import { TakaroService } from '../Base.js';

import { ISteamData, PlayerModel, PlayerRepo } from '../../db/player.js';
import { errors, traceableClass } from '@takaro/util';
import { Redis } from '@takaro/db';
import { PaginatedOutput } from '../../db/base.js';
import {
  PlayerOnGameServerService,
  PlayerOnGameserverOutputDTO,
  PlayerOnGameserverOutputWithRolesDTO,
} from '../PlayerOnGameserverService.js';
import {
  IGamePlayer,
  TakaroEventRoleAssigned,
  TakaroEventRoleRemoved,
  TakaroEventPlayerNewIpDetected,
  TakaroEventPlayerDeleted,
  TakaroEvents,
} from '@takaro/modules';
import { PlayerRoleAssignmentOutputDTO, RoleService } from '../RoleService.js';
import { EVENT_TYPES, EventCreateDTO, EventService } from '../EventService.js';
import { steamApi } from '../../lib/steamApi.js';
import { config } from '../../config.js';

import { GeoIpDbName, open } from 'geolite2-redist';
import maxmind, { CityResponse } from 'maxmind';
import { humanId } from 'human-id';
import { GameServerService } from '../GameServerService.js';
import { IMessageOptsDTO } from '@takaro/gameserver';
import { PlayerSearchInputDTO } from '../../controllers/PlayerController.js';
import { PlayerOutputDTO, PlayerCreateDTO, PlayerUpdateDTO, PlayerOutputWithRolesDTO } from './dto.js';
import { UserService } from '../User/index.js';
import { DiscordService } from '../DiscordService.js';
import { linkSteamPlayerOnGameJoin } from '../../lib/steamAutoLinking.js';
const ipLookup = await open(GeoIpDbName.City, (path) => maxmind.open<CityResponse>(path));

@traceableClass('service:player')
export class PlayerService extends TakaroService<PlayerModel, PlayerOutputDTO, PlayerCreateDTO, PlayerUpdateDTO> {
  get repo() {
    return new PlayerRepo(this.domainId);
  }

  private async handleRoleExpiry(players: PlayerOutputWithRolesDTO[]): Promise<PlayerOutputWithRolesDTO[]> {
    const now = new Date();

    // Collect all expired role assignments across all players
    const allExpiredRoles: Array<{
      playerId: string;
      roleId: string;
      gameServerId?: string;
      role?: any;
    }> = [];

    for (const player of players) {
      const expired = player.roleAssignments.filter((item) => item.expiresAt && new Date(item.expiresAt) < now);

      if (expired.length) {
        this.log.info('Found expired roles for player', {
          playerId: player.id,
          expiredRoles: expired.map((item) => item.roleId),
        });

        // Collect expired roles for batch processing
        expired.forEach((item) => {
          allExpiredRoles.push({
            playerId: player.id,
            roleId: item.roleId,
            gameServerId: item.gameServerId,
            role: item.role,
          });
        });
      }

      // Remove expired roles from the player object
      player.roleAssignments = player.roleAssignments.filter((item) => !expired.includes(item));
    }

    // Batch remove all expired roles if any exist
    if (allExpiredRoles.length > 0) {
      await this.batchRemoveRoles(allExpiredRoles);
    }

    return players;
  }

  private async extend(players: PlayerOutputWithRolesDTO[]): Promise<PlayerOutputWithRolesDTO[]> {
    const roleService = new RoleService(this.domainId);
    const roles = await roleService.find({ filters: { name: ['Player'] } });

    players.map((player) => {
      player.roleAssignments.push(
        new PlayerRoleAssignmentOutputDTO({
          playerId: player.id,
          roleId: roles.results[0].id,
          role: roles.results[0],
        }),
      );
      return player;
    });

    return this.handleRoleExpiry(players);
  }

  async find(filters: Partial<PlayerSearchInputDTO>): Promise<PaginatedOutput<PlayerOutputWithRolesDTO>> {
    // Everyone has the User and Player roles by default
    // Filtering by these roles would be redundant
    if (filters.filters?.roleId) {
      const roleService = new RoleService(this.domainId);
      const role = await roleService.findOne(filters.filters.roleId[0]);
      if ((role?.name === 'Player' || role?.name === 'User') && role.system) {
        delete filters.filters.roleId;
      }
    }

    const players = await this.repo.find(filters);
    players.results = await this.extend(players.results);
    return players;
  }

  async findOne(id: string): Promise<PlayerOutputWithRolesDTO> {
    const player = await this.repo.findOne(id);
    return (await this.extend([player]))[0];
  }

  async create(item: PlayerCreateDTO): Promise<PlayerOutputWithRolesDTO> {
    const created = await this.repo.create(item);

    const eventsService = new EventService(this.domainId);
    await eventsService.create(new EventCreateDTO({ eventName: TakaroEvents.PLAYER_CREATED, playerId: created.id }));

    return this.findOne(created.id);
  }

  async update(id: string, item: PlayerUpdateDTO) {
    const updated = await this.repo.update(id, item);
    return updated;
  }

  async delete(id: string): Promise<string> {
    const player = await this.findOne(id);
    if (!player) throw new errors.NotFoundError();

    await this.repo.delete(id);

    const eventService = new EventService(this.domainId);
    await eventService.create(
      new EventCreateDTO({
        eventName: TakaroEvents.PLAYER_DELETED,
        playerId: id,
        meta: new TakaroEventPlayerDeleted({
          playerName: player.name,
        }),
      }),
    );

    return id;
  }

  async resolveFromId(
    playerId: string,
    gameServerId?: string,
  ): Promise<{ player: PlayerOutputWithRolesDTO; pogs: PlayerOnGameserverOutputWithRolesDTO[] }> {
    const playerOnGameServerService = new PlayerOnGameServerService(this.domainId);
    const player = await this.findOne(playerId);

    const pogs = await playerOnGameServerService.find({ filters: { playerId: [playerId] } });

    return {
      player,
      pogs: pogs.results.filter((item) => !gameServerId || item.gameServerId === gameServerId),
    };
  }

  async resolveRef(
    gamePlayer: IGamePlayer,
    gameServerId: string,
  ): Promise<{ player: PlayerOutputWithRolesDTO; pog: PlayerOnGameserverOutputWithRolesDTO }> {
    // Validate that at least one platform identifier is provided
    if (!gamePlayer.steamId && !gamePlayer.epicOnlineServicesId && !gamePlayer.xboxLiveId && !gamePlayer.platformId) {
      throw new errors.ValidationError(
        'At least one platform identifier (steamId, epicOnlineServicesId, xboxLiveId, or platformId) must be provided',
      );
    }

    const playerOnGameServerService = new PlayerOnGameServerService(this.domainId);
    let pog = await playerOnGameServerService.findAssociations(gamePlayer.gameId, gameServerId);

    let player: PlayerOutputWithRolesDTO | null = null;

    // Use the optimized findByPlatformIds method to avoid multiple queries
    const foundPlayers = await this.repo.findByPlatformIds({
      steamId: gamePlayer.steamId,
      epicOnlineServicesId: gamePlayer.epicOnlineServicesId,
      xboxLiveId: gamePlayer.xboxLiveId,
      platformId: gamePlayer.platformId,
    });

    // Extend the results to add default roles
    const extendedPlayers = await this.extend(foundPlayers);

    // Deduplicate in case a player matches multiple criteria (unlikely but possible)
    const uniquePlayers = extendedPlayers.filter(
      (player, index, self) => self.findIndex((p) => p.id === player.id) === index,
    );

    // If NO players are found, create a new one
    if (!uniquePlayers.length) {
      // Main player profile does not exist yet!
      this.log.debug('No existing associations found, creating new global player', {
        gameId: gamePlayer.gameId,
        gameServerId,
      });
      player = await this.create(
        new PlayerCreateDTO({
          name: gamePlayer.name,
          steamId: gamePlayer.steamId,
          epicOnlineServicesId: gamePlayer.epicOnlineServicesId,
          xboxLiveId: gamePlayer.xboxLiveId,
          platformId: gamePlayer.platformId,
        }),
      );

      // Add initial name to history
      if (gamePlayer.name) {
        await this.repo.observeName(player.id, gameServerId, gamePlayer.name);
      }
    } else {
      // At least one player is found, use the first one
      player = uniquePlayers[0];

      // Track name changes
      if (gamePlayer.name && gamePlayer.name !== player.name) {
        await this.repo.observeName(player.id, gameServerId, gamePlayer.name);
      }

      // Update any missing IDs and name if it changed
      await this.update(
        player.id,
        new PlayerUpdateDTO({
          name: gamePlayer.name,
          steamId: gamePlayer.steamId,
          xboxLiveId: gamePlayer.xboxLiveId,
          epicOnlineServicesId: gamePlayer.epicOnlineServicesId,
          platformId: gamePlayer.platformId,
        }),
      );
    }

    if (!pog) {
      this.log.debug('Creating new player association', { player: player.id, gameServerId });
      pog = await playerOnGameServerService.insertAssociation(gamePlayer.gameId, player.id, gameServerId);
    }

    if (!pog) throw new errors.NotFoundError('PlayerOnGameServer not found');
    if (!player) throw new errors.NotFoundError('Player not found');

    // Auto-link Steam player to user if they have Steam ID and no user linked yet
    if (gamePlayer.steamId && player) {
      try {
        const linkingResult = await linkSteamPlayerOnGameJoin(player.id, gamePlayer.steamId, this.domainId);

        if (linkingResult.success) {
          this.log.info('Successfully auto-linked player to Steam user', {
            playerId: player.id,
            steamId: gamePlayer.steamId,
          });
        } else {
          this.log.debug('Steam auto-linking not successful', {
            playerId: player.id,
            steamId: gamePlayer.steamId,
            reason: linkingResult.error,
          });
        }
      } catch (error) {
        // Don't fail player resolution if auto-linking fails
        this.log.error('Failed to auto-link Steam player', {
          playerId: player.id,
          steamId: gamePlayer.steamId,
          error,
        });
      }
    }

    return {
      player,
      pog,
    };
  }

  async assignRole(roleId: string, targetId: string, gameserverId?: string, expiresAt?: string) {
    const eventService = new EventService(this.domainId);
    const roleService = new RoleService(this.domainId);

    const role = await roleService.findOne(roleId);

    if ((role?.name === 'Player' || role?.name === 'User') && role.system) {
      throw new errors.BadRequestError('Cannot assign Player or User role, everyone has these by default');
    }

    this.log.info('Assigning role to player', { roleId, player: targetId, gameserverId, expiresAt });
    await this.repo.assignRole(targetId, roleId, gameserverId, expiresAt);
    await eventService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.ROLE_ASSIGNED,
        gameserverId,
        playerId: targetId,
        meta: new TakaroEventRoleAssigned({ role }),
      }),
    );

    // Sync Discord roles if the player has a linked user account
    try {
      const userService = new UserService(this.domainId);
      const users = await userService.find({ filters: { playerId: [targetId] } });

      if (users.results.length > 0) {
        const user = users.results[0];
        if (user.discordId) {
          this.log.info('Syncing Discord roles for player-linked user', { playerId: targetId, userId: user.id });
          const discordService = new DiscordService(this.domainId);
          await discordService.syncUserRoles(user.id);
        }
      }
    } catch (error) {
      // Log error but don't throw - we don't want to break role assignment
      this.log.error('Failed to sync Discord roles after player role assignment', {
        playerId: targetId,
        roleId,
        error,
      });
    }
  }

  async removeRole(roleId: string, targetId: string, gameserverId?: string) {
    this.log.info('Removing role from player', { roleId, player: targetId, gameserverId });
    const eventService = new EventService(this.domainId);
    const roleService = new RoleService(this.domainId);

    const role = await roleService.findOne(roleId);
    if (!role) throw new errors.NotFoundError(`Role ${roleId} not found`);
    await this.repo.removeRole(targetId, roleId, gameserverId);
    await eventService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.ROLE_REMOVED,
        playerId: targetId,
        gameserverId,
        meta: new TakaroEventRoleRemoved({ role: { id: role.id, name: role.name } }),
      }),
    );

    // Sync Discord roles if the player has a linked user account
    try {
      const userService = new UserService(this.domainId);
      const users = await userService.find({ filters: { playerId: [targetId] } });

      if (users.results.length > 0) {
        const user = users.results[0];
        if (user.discordId) {
          this.log.info('Syncing Discord roles for player-linked user after role removal', {
            playerId: targetId,
            userId: user.id,
          });
          const discordService = new DiscordService(this.domainId);
          await discordService.syncUserRoles(user.id);
        }
      }
    } catch (error) {
      // Log error but don't throw - we don't want to break role removal
      this.log.error('Failed to sync Discord roles after player role removal', {
        playerId: targetId,
        roleId,
        error,
      });
    }
  }

  private async batchRemoveRoles(
    expiredRoles: Array<{
      playerId: string;
      roleId: string;
      gameServerId?: string;
      role?: any;
    }>,
  ) {
    if (expiredRoles.length === 0) return;

    this.log.info('Batch removing expired roles', { count: expiredRoles.length });

    // Batch remove roles from database
    await this.repo.batchRemoveRoles(expiredRoles);

    // Create events for all removed roles
    const eventService = new EventService(this.domainId);
    const events = expiredRoles.map(
      (expiredRole) =>
        new EventCreateDTO({
          eventName: EVENT_TYPES.ROLE_REMOVED,
          playerId: expiredRole.playerId,
          gameserverId: expiredRole.gameServerId,
          meta: new TakaroEventRoleRemoved({
            role: expiredRole.role
              ? { id: expiredRole.role.id, name: expiredRole.role.name }
              : { id: expiredRole.roleId, name: 'Unknown' },
          }),
        }),
    );

    // Batch create all events
    await Promise.all(events.map((event) => eventService.create(event)));

    // Sync Discord roles for all affected players with linked user accounts
    try {
      const userService = new UserService(this.domainId);
      const uniquePlayerIds = [...new Set(expiredRoles.map((r) => r.playerId))];

      for (const playerId of uniquePlayerIds) {
        const users = await userService.find({ filters: { playerId: [playerId] } });

        if (users.results.length > 0) {
          const user = users.results[0];
          if (user.discordId) {
            this.log.info('Syncing Discord roles for player-linked user after batch role removal', {
              playerId,
              userId: user.id,
            });
            const discordService = new DiscordService(this.domainId);
            await discordService.syncUserRoles(user.id);
          }
        }
      }
    } catch (error) {
      // Log error but don't throw - we don't want to break the batch role removal
      this.log.error('Failed to sync Discord roles after batch player role removal', {
        error,
      });
    }
  }

  /**
   * Syncs steam data for all players that have steamId set
   * @returns Number of players synced
   */
  async handleSteamSync(): Promise<number> {
    if (steamApi.isRateLimited) {
      this.log.error('Rate limited, skipping steam sync');
      return 0;
    }
    const toRefresh = await this.repo.getPlayersToRefreshSteam();

    if (!toRefresh.length) return 0;

    const [summaries, bans] = await Promise.all([
      steamApi.getPlayerSummaries(toRefresh),
      steamApi.getPlayerBans(toRefresh),
    ]);

    const fullData: (ISteamData | { steamId: string })[] = await Promise.all(
      toRefresh.map(async (steamId) => {
        const summary = summaries.find((item) => item.steamid === steamId);
        const ban = bans.find((item) => item.SteamId === steamId);

        if (!summary || !ban) {
          this.log.warn('Steam data missing', { steamId, summary, ban });
          return {
            steamId,
          };
        }

        return {
          steamId,
          steamAvatar: summary.avatarfull,
          steamAccountCreated: summary.timecreated,
          steamCommunityBanned: ban.CommunityBanned,
          steamEconomyBan: ban.EconomyBan,
          steamVacBanned: ban.VACBanned,
          steamsDaysSinceLastBan: ban.DaysSinceLastBan,
          steamNumberOfVACBans: ban.NumberOfVACBans,
          steamLevel: summary ? await steamApi.getLevel(steamId) : null,
        };
      }),
    );

    await this.repo.setSteamData(fullData);
    return toRefresh.length;
  }

  async observeIp(playerId: string, gameServerId: string, ip: string) {
    const lookupResult = ipLookup.get(ip);

    let newIpRecord;

    if (lookupResult?.country) {
      newIpRecord = await this.repo.observeIp(playerId, gameServerId, ip, {
        country: lookupResult.country.iso_code,
        city: lookupResult.city?.names.en ?? null,
        latitude: lookupResult.location?.latitude.toString() ?? null,
        longitude: lookupResult.location?.longitude.toString() ?? null,
      });
    } else {
      newIpRecord = await this.repo.observeIp(playerId, gameServerId, ip, null);
    }

    if (newIpRecord) {
      const eventsService = new EventService(this.domainId);
      await eventsService.create(
        new EventCreateDTO({
          gameserverId: gameServerId,
          playerId: playerId,
          eventName: EVENT_TYPES.PLAYER_NEW_IP_DETECTED,
          meta: new TakaroEventPlayerNewIpDetected({
            ip: ip,
            city: newIpRecord.city,
            country: newIpRecord.country,
            latitude: newIpRecord.latitude,
            longitude: newIpRecord.longitude,
          }),
        }),
      );
    }
  }

  async calculatePlayerActivityMetrics() {
    return this.repo.calculatePlayerActivityMetrics();
  }

  async handlePlayerLink(player: PlayerOutputDTO, pog: PlayerOnGameserverOutputDTO) {
    const secretCode = humanId({ separator: '-', capitalize: false });
    const redis = await Redis.getClient('playerLink');

    // First, check if the player has any pending codes from before
    const allKeys = await redis.keys('playerLink:*');
    for (const key of allKeys) {
      const storedPlayerId = await redis.get(key);
      if (storedPlayerId === player.id) {
        this.log.info('Found existing player link code', { key, playerId: player.id });
        await redis.del(key);
        await redis.del(`${key}-domain`);
      }
    }

    await redis.set(`playerLink:${secretCode}`, player.id, {
      EX: 60 * 30,
    });
    await redis.set(`playerLink:${secretCode}-domain`, this.domainId, {
      EX: 60 * 30,
    });

    const gameServerService = new GameServerService(this.domainId);
    await gameServerService.sendMessage(
      pog.gameServerId,
      `Browse to ${config.get('http.frontendHost')}/link?code=${secretCode} to complete the linking process.`,
      new IMessageOptsDTO({
        recipient: pog,
      }),
    );
  }
}
