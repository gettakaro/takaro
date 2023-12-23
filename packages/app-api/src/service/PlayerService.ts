import { TakaroService } from './Base.js';

import { ISteamData, PlayerModel, PlayerRepo } from '../db/player.js';
import { IsBoolean, IsISO8601, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TakaroDTO, TakaroModelDTO, traceableClass } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { PlayerOnGameServerService, PlayerOnGameserverOutputDTO } from './PlayerOnGameserverService.js';
import { IGamePlayer } from '@takaro/modules';
import { IPlayerReferenceDTO } from '@takaro/gameserver';
import { Type } from 'class-transformer';
import { PlayerRoleAssignmentOutputDTO, RoleService } from './RoleService.js';
import { EVENT_TYPES, EventCreateDTO, EventService } from './EventService.js';
import { steamApi } from '../lib/steamApi.js';
import { config } from '../config.js';

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
  steamAccountCreated?: Date;

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

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PlayerOnGameserverOutputDTO)
  playerOnGameServers?: PlayerOnGameserverOutputDTO[];
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
    await Promise.all(expired.map((item) => this.removeRole(item.roleId, player.id)));

    // Delete expired roles from original object
    player.roleAssignments = player.roleAssignments.filter((item) => !expired.includes(item));
    return player;
  }

  private async extend(player: PlayerOutputWithRolesDTO): Promise<PlayerOutputWithRolesDTO> {
    const roleService = new RoleService(this.domainId);
    const roles = await roleService.find({ filters: { name: ['Player'] } });

    player.roleAssignments.push(
      await new PlayerRoleAssignmentOutputDTO().construct({
        playerId: player.id,
        roleId: roles.results[0].id,
        role: roles.results[0],
      })
    );

    await this.handleRoleExpiry(player);

    return player;
  }

  async find(filters: ITakaroQuery<PlayerOutputDTO>): Promise<PaginatedOutput<PlayerOutputDTO>> {
    const players = await this.repo.find(filters);
    players.results = await Promise.all(players.results.map((item) => this.extend(item)));
    return players;
  }

  async findOne(id: string): Promise<PlayerOutputWithRolesDTO> {
    const player = await this.repo.findOne(id);
    return this.extend(player);
  }

  async create(item: PlayerCreateDTO) {
    const created = await this.repo.create(item);
    return created;
  }

  async update(id: string, item: PlayerUpdateDTO) {
    const updated = await this.repo.update(id, item);
    return updated;
  }

  async delete(id: string) {
    await this.repo.delete(id);
    return id;
  }

  async sync(playerData: IGamePlayer, gameServerId: string) {
    const playerOnGameServerService = new PlayerOnGameServerService(this.domainId);
    const existingAssociations = await playerOnGameServerService.findAssociations(playerData.gameId, gameServerId);
    let player: PlayerOutputDTO;

    if (!existingAssociations.length) {
      const existingPlayers = await this.find({
        filters: {
          steamId: [playerData.steamId],
          epicOnlineServicesId: [playerData.epicOnlineServicesId],
          xboxLiveId: [playerData.xboxLiveId],
        },
      });
      if (!existingPlayers.results.length) {
        // Main player profile does not exist yet!
        this.log.debug('No existing associations found, creating new global player');
        player = await this.create(
          await new PlayerCreateDTO().construct({
            name: playerData.name,
            steamId: playerData.steamId,
            epicOnlineServicesId: playerData.epicOnlineServicesId,
            xboxLiveId: playerData.xboxLiveId,
          })
        );
      } else {
        player = existingPlayers.results[0];
      }

      this.log.debug('Creating new player association', { player, gameServerId });
      await playerOnGameServerService.insertAssociation(playerData.gameId, player.id, gameServerId);
    }
  }

  async resolveRef(ref: IPlayerReferenceDTO, gameserverId: string): Promise<PlayerOutputDTO> {
    const playerOnGameServerService = new PlayerOnGameServerService(this.domainId);
    const playerOnGameServer = await playerOnGameServerService.resolveRef(ref, gameserverId);
    return this.findOne(playerOnGameServer.playerId);
  }

  async getRef(playerId: string, gameserverId: string) {
    const playerOnGameServerService = new PlayerOnGameServerService(this.domainId);
    return playerOnGameServerService.getRef(playerId, gameserverId);
  }

  async assignRole(roleId: string, targetId: string, gameserverId?: string, expiresAt?: string) {
    const eventService = new EventService(this.domainId);

    this.log.info('Assigning role to player');
    await this.repo.assignRole(targetId, roleId, gameserverId, expiresAt);
    await eventService.create(
      await new EventCreateDTO().construct({
        eventName: EVENT_TYPES.ROLE_ASSIGNED,
        gameserverId,
        playerId: targetId,
        meta: {
          roleId: roleId,
        },
      })
    );
  }

  async removeRole(roleId: string, targetId: string, gameserverId?: string) {
    this.log.info('Removing role from player');
    const eventService = new EventService(this.domainId);
    await this.repo.removeRole(targetId, roleId, gameserverId);
    await eventService.create(
      await new EventCreateDTO().construct({
        eventName: EVENT_TYPES.ROLE_REMOVED,
        playerId: targetId,
        gameserverId,
        meta: {
          roleId: roleId,
        },
      })
    );
  }

  async handleSteamSync() {
    if (!config.get('steam.apiKey')) return;
    const toRefresh = await this.repo.getPlayersToRefreshSteam();

    if (!toRefresh.length) return;

    const [summaries, bans] = await Promise.all([
      steamApi.getPlayerSummaries(toRefresh),
      steamApi.getPlayerBans(toRefresh),
    ]);

    const fullData: (ISteamData | undefined)[] = toRefresh.map((steamId) => {
      const summary = summaries.find((item) => item.steamid === steamId);
      const ban = bans.find((item) => item.SteamId === steamId);

      if (!summary || !ban) {
        this.log.warn('Steam data missing', { steamId, summary, ban });
        return;
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
      };
    });

    await this.repo.setSteamData(fullData);
  }
}
