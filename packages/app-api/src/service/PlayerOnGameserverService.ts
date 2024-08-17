import { TakaroService } from './Base.js';

import { IsBoolean, IsIP, IsISO8601, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { TakaroDTO, TakaroModelDTO, ctx, errors, traceableClass } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { PlayerOnGameServerModel, PlayerOnGameServerRepo } from '../db/playerOnGameserver.js';
import { IItemDTO } from '@takaro/gameserver';
import { Type } from 'class-transformer';
import { PlayerRoleAssignmentOutputDTO, RoleService } from './RoleService.js';
import { EVENT_TYPES, EventCreateDTO, EventService } from './EventService.js';
import { IGamePlayer, TakaroEventCurrencyAdded, TakaroEventCurrencyDeducted, TakaroEvents } from '@takaro/modules';
import { PlayerService } from './PlayerService.js';

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

  @IsISO8601()
  lastSeen!: string;
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
  private playerService = new PlayerService(this.domainId);

  get repo() {
    return new PlayerOnGameServerRepo(this.domainId);
  }

  private async extend(
    players: PlayerOnGameserverOutputWithRolesDTO | PlayerOnGameserverOutputWithRolesDTO[],
  ): Promise<PlayerOnGameserverOutputWithRolesDTO[]> {
    const roleService = new RoleService(this.domainId);
    const roles = await roleService.find({ filters: { name: ['Player'] } });

    if (!Array.isArray(players)) {
      players = [players];
    }

    for (const player of players) {
      player.roles.push(
        new PlayerRoleAssignmentOutputDTO({
          roleId: roles.results[0].id,
          role: roles.results[0],
        }),
      );
    }

    // Filter out any roles that are expired
    for (const player of players) {
      player.roles = player.roles.filter((role) => {
        if (role.expiresAt) {
          return new Date(role.expiresAt) > new Date();
        }
        return true;
      });
    }

    return players;
  }

  async find(
    filters: ITakaroQuery<PlayerOnGameserverOutputDTO>,
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

  /**
   * Not implemented, use the insertAssociation method instead
   * @param _item
   */
  async create(_item: PlayerOnGameServerCreateDTO): Promise<PlayerOnGameserverOutputDTO> {
    throw new errors.NotImplementedError();
  }

  async update(id: string, item: PlayerOnGameServerUpdateDTO) {
    const updated = await this.repo.update(id, item);
    return this.findOne(updated.id);
  }

  async delete(id: string) {
    await this.repo.delete(id);
    return id;
  }

  async getPog(playerId: string, gameserverId: string): Promise<PlayerOnGameserverOutputDTO> {
    return this.repo.getPog(playerId, gameserverId);
  }

  async findAssociations(gameId: string, gameServerId: string): Promise<PlayerOnGameserverOutputWithRolesDTO | null> {
    const pogModel = await this.repo.findGameAssociations(gameId, gameServerId);

    if (!pogModel) {
      return null;
    }

    return this.findOne(pogModel.id);
  }

  async insertAssociation(gameId: string, playerId: string, gameServerId: string) {
    const created = await this.repo.insertAssociation(gameId, playerId, gameServerId);

    const eventsService = new EventService(this.domainId);
    await eventsService.create(
      new EventCreateDTO({
        eventName: TakaroEvents.PLAYER_CREATED,
        playerId: playerId,
        gameserverId: gameServerId,
      }),
    );

    return this.findOne(created.id);
  }

  async setCurrency(id: string, currency: number) {
    try {
      const res = await this.repo.update(id, new PlayerOnGameServerUpdateDTO({ currency }));
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
      new EventCreateDTO({
        eventName: EVENT_TYPES.CURRENCY_DEDUCTED,
        playerId: senderRecord.playerId,
        gameserverId: senderRecord.gameServerId,
        userId,
        meta: new TakaroEventCurrencyDeducted({
          amount,
        }),
      }),
    );

    await eventsService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.CURRENCY_ADDED,
        playerId: receiverRecord.playerId,
        gameserverId: receiverRecord.gameServerId,
        userId,
        meta: new TakaroEventCurrencyAdded({
          amount,
        }),
      }),
    );
  }

  async deductCurrency(id: string, amount: number) {
    const updatedPlayerOnGameServer = await this.repo.deductCurrency(id, amount);
    const eventsService = new EventService(this.domainId);
    const record = await this.findOne(id);
    const userId = ctx.data.user;

    await eventsService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.CURRENCY_DEDUCTED,
        playerId: record.playerId,
        gameserverId: record.gameServerId,
        userId,
        meta: new TakaroEventCurrencyDeducted({
          amount,
        }),
      }),
    );

    return updatedPlayerOnGameServer;
  }

  async addCurrency(id: string, amount: number): Promise<PlayerOnGameserverOutputDTO> {
    const updatedPlayerOnGameServer = await this.repo.addCurrency(id, amount);
    const eventsService = new EventService(this.domainId);
    const record = await this.findOne(id);
    const userId = ctx.data.user;

    await eventsService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.CURRENCY_ADDED,
        playerId: record.playerId,
        gameserverId: record.gameServerId,
        userId,
        meta: new TakaroEventCurrencyAdded({
          amount,
        }),
      }),
    );

    return updatedPlayerOnGameServer;
  }
  async setOnlinePlayers(gameServerId: string, players: IGamePlayer[]) {
    await this.repo.setOnlinePlayers(gameServerId, players);
  }
}
