import { TakaroService } from './Base.js';

import { IsIP, IsNumber, IsOptional, IsString } from 'class-validator';
import { TakaroDTO, TakaroModelDTO, traceableClass } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { PlayerOnGameServerModel, PlayerOnGameServerRepo } from '../db/playerOnGameserver.js';
import { IPlayerReferenceDTO } from '@takaro/gameserver';

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

  find(filters: ITakaroQuery<PlayerOnGameserverOutputDTO>): Promise<PaginatedOutput<PlayerOnGameserverOutputDTO>> {
    return this.repo.find(filters);
  }

  findOne(id: string): Promise<PlayerOnGameserverOutputDTO> {
    return this.repo.findOne(id);
  }

  async create(item: PlayerOnGameServerCreateDTO) {
    const created = await this.repo.create(item);
    return created;
  }

  async update(id: string, item: PlayerOnGameServerUpdateDTO) {
    const updated = await this.repo.update(id, item);
    return updated;
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

  async resolveRef(ref: IPlayerReferenceDTO, gameserverId: string): Promise<PlayerOnGameserverOutputDTO> {
    return this.repo.resolveRef(ref, gameserverId);
  }

  async getRef(playerId: string, gameserverId: string) {
    return this.repo.getRef(playerId, gameserverId);
  }

  async addInfo(ref: IPlayerReferenceDTO, gameserverId: string, data: PlayerOnGameServerUpdateDTO) {
    const resolved = await this.resolveRef(ref, gameserverId);
    return this.update(resolved.id, data);
  }
}
