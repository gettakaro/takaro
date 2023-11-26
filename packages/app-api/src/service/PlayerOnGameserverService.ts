import { TakaroService } from './Base.js';

import { IsIP, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { TakaroDTO, TakaroModelDTO, errors, traceableClass } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { PlayerOnGameServerModel, PlayerOnGameServerRepo } from '../db/playerOnGameserver.js';
import { IPlayerReferenceDTO } from '@takaro/gameserver';
import { Type } from 'class-transformer';
import { PlayerRoleAssignmentOutputDTO, RoleService } from './RoleService.js';

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

  async getRef(playerId: string, gameserverId: string) {
    return this.repo.getRef(playerId, gameserverId);
  }

  async addInfo(ref: IPlayerReferenceDTO, gameserverId: string, data: PlayerOnGameServerUpdateDTO) {
    const resolved = await this.resolveRef(ref, gameserverId);
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
    return this.repo.transact(senderId, receiverId, amount);
  }

  async deductCurrency(id: string, amount: number) {
    return this.repo.deductCurrency(id, amount);
  }

  async addCurrency(id: string, amount: number) {
    return this.repo.addCurrency(id, amount);
  }
}
