import { TakaroService } from './Base.js';

import { IsBoolean, IsIP, IsISO8601, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { TakaroDTO, TakaroModelDTO, ctx, errors, traceableClass } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { PlayerOnGameServerModel, PlayerOnGameServerRepo } from '../db/playerOnGameserver.js';
import { IItemDTO, IPlayerReferenceDTO } from '@takaro/gameserver';
import { Type } from 'class-transformer';
import { PlayerRoleAssignmentOutputDTO, RoleService } from './RoleService.js';
import { EVENT_TYPES, EventCreateDTO, EventService } from './EventService.js';
import { IGamePlayer } from '@takaro/modules';

import { GeoIpDbName, open } from 'geolite2-redist';
import maxmind, { CityResponse } from 'maxmind';

const ipLookup = await open(GeoIpDbName.City, (path) => maxmind.open<CityResponse>(path));

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

export class PlayerOnGameserverOutputDTO extends TakaroModelDTO<PlayerOnGameserverOutputDTO> {
  @IsString()
  gameServerId: string;

  @IsString()
  playerId: string;

  @IsString()
  gameId: string;

  @IsNumber()
  @IsOptional()
  positionX: number;

  @IsNumber()
  @IsOptional()
  positionY: number;

  @IsNumber()
  @IsOptional()
  positionZ: number;

  @IsIP()
  @IsOptional()
  ip: string;

  @IsNumber()
  @IsOptional()
  ping: number;

  @IsNumber()
  currency: number;

  @IsBoolean()
  online: boolean;

  @ValidateNested({ each: true })
  @Type(() => IItemDTO)
  inventory: IItemDTO[];

  @ValidateNested({ each: true })
  @Type(() => IpHistoryOutputDTO)
  ipHistory: IpHistoryOutputDTO[];
}

export class PlayerOnGameserverOutputWithRolesDTO extends PlayerOnGameserverOutputDTO {
  @Type(() => PlayerRoleAssignmentOutputDTO)
  @ValidateNested({ each: true })
  roles: PlayerRoleAssignmentOutputDTO[];
}

export class PlayerOnGameServerCreateDTO extends TakaroDTO<PlayerOnGameServerCreateDTO> {
  @IsString()
  gameServerId: string;

  @IsString()
  playerId: string;

  @IsString()
  gameId: string;
}

export class PlayerOnGameServerUpdateDTO extends TakaroDTO<PlayerOnGameServerUpdateDTO> {
  @IsNumber()
  @IsOptional()
  positionX: number;

  @IsNumber()
  @IsOptional()
  positionY: number;

  @IsNumber()
  @IsOptional()
  positionZ: number;

  @IsIP()
  @IsOptional()
  ip: string;

  @IsNumber()
  @IsOptional()
  ping: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  currency: number;

  @IsBoolean()
  online: boolean;
}

@traceableClass('service:playerOnGameserver')
export class PlayerOnGameServerService extends TakaroService<
  PlayerOnGameServerModel,
  PlayerOnGameserverOutputDTO,
  PlayerOnGameServerCreateDTO,
  PlayerOnGameServerUpdateDTO
> {
  get repo() {
    return new PlayerOnGameServerRepo(this.domainId);
  }

  private async extend(
    players: PlayerOnGameserverOutputWithRolesDTO | PlayerOnGameserverOutputWithRolesDTO[]
  ): Promise<PlayerOnGameserverOutputWithRolesDTO[]> {
    const roleService = new RoleService(this.domainId);
    const roles = await roleService.find({ filters: { name: ['Player'] } });

    if (!Array.isArray(players)) {
      players = [players];
    }

    for (const player of players) {
      player.roles.push(
        await new PlayerRoleAssignmentOutputDTO().construct({
          roleId: roles.results[0].id,
          role: roles.results[0],
        })
      );
    }

    return players;
  }

  async find(
    filters: ITakaroQuery<PlayerOnGameserverOutputDTO>
  ): Promise<PaginatedOutput<PlayerOnGameserverOutputWithRolesDTO>> {
    const res = await this.repo.find(filters);
    return {
      ...res,
      results: await this.extend(res.results),
    };
  }

  async findOne(id: string): Promise<PlayerOnGameserverOutputWithRolesDTO> {
    const data = await this.repo.findOne(id);
    return (await this.extend(data))[0];
  }

  async create(item: PlayerOnGameServerCreateDTO) {
    const created = await this.repo.create(item);
    return this.findOne(created.id);
  }

  async update(id: string, item: PlayerOnGameServerUpdateDTO) {
    const updated = await this.repo.update(id, item);
    return this.findOne(updated.id);
  }

  async delete(id: string) {
    await this.repo.delete(id);
    return id;
  }

  async findAssociations(gameId: string, gameServerId: string) {
    return this.repo.findGameAssociations(gameId, gameServerId);
  }

  async insertAssociation(gameId: string, playerId: string, gameServerId: string) {
    return this.repo.insertAssociation(gameId, playerId, gameServerId);
  }

  async resolveRef(ref: IPlayerReferenceDTO, gameserverId: string): Promise<PlayerOnGameserverOutputWithRolesDTO> {
    const player = await this.repo.resolveRef(ref, gameserverId);
    return this.findOne(player.id);
  }

  async getRef(playerId: string, gameserverId: string): Promise<PlayerOnGameserverOutputDTO> {
    return this.repo.getRef(playerId, gameserverId);
  }

  async addInfo(ref: IPlayerReferenceDTO, gameserverId: string, data: PlayerOnGameServerUpdateDTO) {
    const resolved = await this.resolveRef(ref, gameserverId);

    if (data.ip) {
      const lookupResult = (await ipLookup).get(data.ip);

      let newIpRecord;

      if (lookupResult && lookupResult.country) {
        newIpRecord = await this.repo.observeIp(resolved.id, data.ip, {
          country: lookupResult.country.iso_code,
          city: lookupResult.city?.names.en || null,
          latitude: lookupResult.location?.latitude.toString() || null,
          longitude: lookupResult.location?.longitude.toString() || null,
        });
      } else {
        newIpRecord = await this.repo.observeIp(resolved.id, data.ip, null);
      }

      if (newIpRecord) {
        const eventsService = new EventService(this.domainId);
        await eventsService.create(
          await new EventCreateDTO().construct({
            gameserverId,
            playerId: resolved.playerId,
            eventName: EVENT_TYPES.PLAYER_NEW_IP_DETECTED,
            meta: {
              new: newIpRecord,
              old: resolved.ipHistory[resolved.ipHistory.length - 1],
            },
          })
        );
      }
    }

    return this.update(resolved.id, data);
  }

  async setCurrency(id: string, currency: number) {
    try {
      const res = await this.repo.update(id, await new PlayerOnGameServerUpdateDTO().construct({ currency }));
      return res;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'CheckViolationError' && 'constraint' in error && error.constraint === 'currency_positive') {
          throw new errors.BadRequestError('Currency must be positive');
        }
      }
      throw error;
    }
  }

  async transact(senderId: string, receiverId: string, amount: number) {
    await this.repo.transact(senderId, receiverId, amount);

    const eventsService = new EventService(this.domainId);
    const senderRecord = await this.findOne(senderId);
    const receiverRecord = await this.findOne(receiverId);
    const userId = ctx.data.user;
    await eventsService.create(
      await new EventCreateDTO().construct({
        eventName: EVENT_TYPES.CURRENCY_DEDUCTED,
        playerId: senderRecord.playerId,
        gameserverId: senderRecord.gameServerId,
        userId,
        meta: { amount, receiver: receiverRecord.playerId },
      })
    );

    await eventsService.create(
      await new EventCreateDTO().construct({
        eventName: EVENT_TYPES.CURRENCY_ADDED,
        playerId: receiverRecord.playerId,
        gameserverId: receiverRecord.gameServerId,
        userId,
        meta: { amount, sender: senderRecord.playerId },
      })
    );
  }

  async deductCurrency(id: string, amount: number) {
    await this.repo.deductCurrency(id, amount);
    const eventsService = new EventService(this.domainId);
    const record = await this.findOne(id);
    const userId = ctx.data.user;

    await eventsService.create(
      await new EventCreateDTO().construct({
        eventName: EVENT_TYPES.CURRENCY_DEDUCTED,
        playerId: record.playerId,
        gameserverId: record.gameServerId,
        userId,
        meta: { amount },
      })
    );
  }

  async addCurrency(id: string, amount: number) {
    await this.repo.addCurrency(id, amount);
    const eventsService = new EventService(this.domainId);
    const record = await this.findOne(id);
    const userId = ctx.data.user;

    await eventsService.create(
      await new EventCreateDTO().construct({
        eventName: EVENT_TYPES.CURRENCY_ADDED,
        playerId: record.playerId,
        gameserverId: record.gameServerId,
        userId,
        meta: { amount },
      })
    );
  }
  async setOnlinePlayers(gameServerId: string, players: IGamePlayer[]) {
    await this.repo.setOnlinePlayers(gameServerId, players);
  }
}
