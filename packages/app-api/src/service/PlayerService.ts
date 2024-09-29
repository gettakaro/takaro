import { TakaroService } from './Base.js';

import { ISteamData, PlayerModel, PlayerRepo } from '../db/player.js';
import { IsBoolean, IsISO8601, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TakaroDTO, TakaroModelDTO, errors, traceableClass } from '@takaro/util';
import { Redis } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import {
  PlayerOnGameServerService,
  PlayerOnGameserverOutputDTO,
  PlayerOnGameserverOutputWithRolesDTO,
} from './PlayerOnGameserverService.js';
import {
  IGamePlayer,
  TakaroEventRoleAssigned,
  TakaroEventRoleRemoved,
  TakaroEventPlayerNewIpDetected,
  TakaroEvents,
} from '@takaro/modules';
import { Type } from 'class-transformer';
import { PlayerRoleAssignmentOutputDTO, RoleService } from './RoleService.js';
import { EVENT_TYPES, EventCreateDTO, EventService } from './EventService.js';
import { steamApi } from '../lib/steamApi.js';
import { config } from '../config.js';

import { GeoIpDbName, open } from 'geolite2-redist';
import maxmind, { CityResponse } from 'maxmind';
import { humanId } from 'human-id';
import { GameServerService } from './GameServerService.js';
import { IMessageOptsDTO } from '@takaro/gameserver';
import { PlayerSearchInputDTO } from '../controllers/PlayerController.js';

const ipLookup = await open(GeoIpDbName.City, (path) => maxmind.open<CityResponse>(path));

export class PlayerOutputDTO extends TakaroModelDTO<PlayerOutputDTO> {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  steamId?: string;
  @IsString()
  @IsOptional()
  xboxLiveId?: string;
  @IsString()
  @IsOptional()
  epicOnlineServicesId?: string;

  @IsString()
  @IsOptional()
  steamAvatar?: string;

  @IsISO8601()
  @IsOptional()
  steamAccountCreated?: string;

  @IsBoolean()
  @IsOptional()
  steamCommunityBanned?: boolean;

  @IsString()
  @IsOptional()
  steamEconomyBan?: string;

  @IsBoolean()
  @IsOptional()
  steamVacBanned?: boolean;

  @IsNumber()
  @IsOptional()
  steamsDaysSinceLastBan?: number;

  @IsNumber()
  @IsOptional()
  steamNumberOfVACBans?: number;

  @IsNumber()
  @IsOptional()
  steamLevel?: number;

  @IsNumber()
  playtimeSeconds: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PlayerOnGameserverOutputDTO)
  playerOnGameServers?: PlayerOnGameserverOutputDTO[];

  @ValidateNested({ each: true })
  @Type(() => IpHistoryOutputDTO)
  ipHistory: IpHistoryOutputDTO[];
}

export class IpHistoryOutputDTO extends TakaroDTO<IpHistoryOutputDTO> {
  @IsISO8601()
  createdAt: string;

  @IsString()
  ip: string;

  @IsString()
  @IsOptional()
  country: string;

  @IsString()
  @IsOptional()
  city: string;

  @IsString()
  @IsOptional()
  latitude: string;

  @IsString()
  @IsOptional()
  longitude: string;
}

export class PlayerOutputWithRolesDTO extends PlayerOutputDTO {
  @Type(() => PlayerRoleAssignmentOutputDTO)
  @ValidateNested({ each: true })
  roleAssignments: PlayerRoleAssignmentOutputDTO[];
}

export class PlayerCreateDTO extends TakaroDTO<PlayerCreateDTO> {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  steamId?: string;
  @IsString()
  @IsOptional()
  xboxLiveId?: string;
  @IsString()
  @IsOptional()
  epicOnlineServicesId?: string;
}

export class PlayerUpdateDTO extends TakaroDTO<PlayerUpdateDTO> {
  @IsString()
  name!: string;
  @IsString()
  @IsOptional()
  steamId?: string;
  @IsString()
  @IsOptional()
  xboxLiveId?: string;
  @IsString()
  @IsOptional()
  epicOnlineServicesId?: string;
  @IsNumber()
  @IsOptional()
  playtimeSeconds?: number;
}

@traceableClass('service:player')
export class PlayerService extends TakaroService<PlayerModel, PlayerOutputDTO, PlayerCreateDTO, PlayerUpdateDTO> {
  get repo() {
    return new PlayerRepo(this.domainId);
  }

  private async handleRoleExpiry(player: PlayerOutputWithRolesDTO): Promise<PlayerOutputWithRolesDTO> {
    const now = new Date();
    const expired = player.roleAssignments.filter((item) => item.expiresAt && new Date(item.expiresAt) < now);

    if (expired.length) this.log.info('Removing expired roles', { expired: expired.map((item) => item.roleId) });
    await Promise.all(expired.map((item) => this.removeRole(item.roleId, player.id, item.gameServerId)));

    // Delete expired roles from original object
    player.roleAssignments = player.roleAssignments.filter((item) => !expired.includes(item));
    return player;
  }

  private async extend(player: PlayerOutputWithRolesDTO): Promise<PlayerOutputWithRolesDTO> {
    const roleService = new RoleService(this.domainId);
    const roles = await roleService.find({ filters: { name: ['Player'] } });

    player.roleAssignments.push(
      new PlayerRoleAssignmentOutputDTO({
        playerId: player.id,
        roleId: roles.results[0].id,
        role: roles.results[0],
      }),
    );

    return this.handleRoleExpiry(player);
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
    players.results = await Promise.all(players.results.map((item) => this.extend(item)));
    return players;
  }

  async findOne(id: string): Promise<PlayerOutputWithRolesDTO> {
    const player = await this.repo.findOne(id);
    return this.extend(player);
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

  async delete(id: string) {
    await this.repo.delete(id);
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
    const playerOnGameServerService = new PlayerOnGameServerService(this.domainId);
    let pog = await playerOnGameServerService.findAssociations(gamePlayer.gameId, gameServerId);

    let player: PlayerOutputWithRolesDTO | null = null;

    const promises = [];

    if (gamePlayer.steamId) promises.push(this.find({ filters: { steamId: [gamePlayer.steamId] } }));
    if (gamePlayer.epicOnlineServicesId)
      promises.push(this.find({ filters: { epicOnlineServicesId: [gamePlayer.epicOnlineServicesId] } }));
    if (gamePlayer.xboxLiveId) promises.push(this.find({ filters: { xboxLiveId: [gamePlayer.xboxLiveId] } }));

    const promiseResults = await Promise.all(promises);
    // Merge all results into one array
    const foundPlayers = promiseResults.reduce((acc: PlayerOutputWithRolesDTO[], item) => acc.concat(item.results), []);

    // If NO players are found, create a new one
    if (!foundPlayers.length) {
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
        }),
      );
    } else {
      // At least one player is found, use the first one
      player = foundPlayers[0];

      // Also, update any missing IDs and names
      await this.update(
        player.id,
        new PlayerUpdateDTO({
          name: gamePlayer.name,
          steamId: gamePlayer.steamId,
          xboxLiveId: gamePlayer.xboxLiveId,
          epicOnlineServicesId: gamePlayer.epicOnlineServicesId,
        }),
      );
    }

    if (!pog) {
      this.log.debug('Creating new player association', { player: player.id, gameServerId });
      pog = await playerOnGameServerService.insertAssociation(gamePlayer.gameId, player.id, gameServerId);
    }

    if (!pog) throw new errors.NotFoundError('PlayerOnGameServer not found');
    if (!player) throw new errors.NotFoundError('Player not found');

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
  }

  /**
   * Syncs steam data for all players that have steamId set
   * @returns Number of players synced
   */
  async handleSteamSync(): Promise<number> {
    if (!config.get('steam.apiKey')) {
      this.log.warn('Steam API key not set, skipping sync');
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
    await redis.set(secretCode, player.id, {
      EX: 60 * 30,
    });
    await redis.set(`${secretCode}-domain`, this.domainId, {
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
