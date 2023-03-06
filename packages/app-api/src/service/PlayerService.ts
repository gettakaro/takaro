import { TakaroService } from './Base.js';

import { PlayerModel, PlayerRepo } from '../db/player.js';
import { IsOptional, IsString } from 'class-validator';
import { IGamePlayer } from '@takaro/gameserver';
import { TakaroDTO, TakaroModelDTO } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';

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

  async sync(playerData: IGamePlayer, gameServerId: string) {
    const existingAssociations = await this.findAssociations(playerData.gameId);
    let player: PlayerOutputDTO;

    if (!existingAssociations.length) {
      const existingPlayers = await this.find({
        filters: {
          steamId: playerData.steamId,
          epicOnlineServicesId: playerData.epicOnlineServicesId,
          xboxLiveId: playerData.xboxLiveId,
        },
      });
      if (!existingPlayers.results.length) {
        // Main player profile does not exist yet!
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

      await this.insertAssociation(playerData.gameId, player.id, gameServerId);
    }
  }
}
