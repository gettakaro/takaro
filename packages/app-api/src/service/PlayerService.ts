import { TakaroService } from './Base';

import { PlayerModel, PlayerRepo } from '../db/player';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { TakaroDTO } from '@takaro/http';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base';

export class PlayerOutputDTO extends TakaroDTO<PlayerOutputDTO> {
  @IsUUID()
  id!: string;

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

export class PlayerService extends TakaroService<
  PlayerModel,
  PlayerOutputDTO,
  PlayerCreateDTO,
  PlayerUpdateDTO
> {
  get repo() {
    return new PlayerRepo(this.domainId);
  }

  find(
    filters: ITakaroQuery<PlayerOutputDTO>
  ): Promise<PaginatedOutput<PlayerOutputDTO>> {
    return this.repo.find(filters);
  }

  findOne(id: string): Promise<PlayerOutputDTO> {
    return this.repo.findOne(id);
  }

  async create(item: PlayerCreateDTO) {
    const created = await this.repo.create(item);
    return created;
  }

  async update(id: string, item: PlayerUpdateDTO) {
    const updated = await this.repo.update(id, item);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }

  async findAssociations(gameId: string) {
    return this.repo.findGameAssociations(gameId);
  }

  async insertAssociation(
    gameId: string,
    playerId: string,
    gameServerId: string
  ) {
    return this.repo.insertAssociation(gameId, playerId, gameServerId);
  }
}
