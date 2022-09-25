import { TakaroService } from './Base';

import { PlayerModel, PlayerRepo } from '../db/player';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class PlayerOutputDTO {
  @IsUUID()
  id!: string;

  @IsString()
  name!: string;
}

export class PlayerCreateDTO {
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

export class UpdatePlayerDTO {
  @IsString()
  name!: string;
}

export class PlayerService extends TakaroService<PlayerModel> {
  get repo() {
    return new PlayerRepo(this.domainId);
  }

  async create(item: PlayerCreateDTO) {
    const created = await this.repo.create(item);
    return created;
  }

  async update(id: string, item: UpdatePlayerDTO) {
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
