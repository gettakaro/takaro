import { TakaroService } from './Base';

import { PlayerModel, PlayerRepo } from '../db/player';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { IGamePlayer } from '@takaro/gameserver';

export class PlayerOutputDTO {
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
        player = await this.create({
          name: playerData.name,
          epicOnlineServicesId: playerData.epicOnlineServicesId,
          steamId: playerData.steamId,
          xboxLiveId: playerData.xboxLiveId,
        });
      } else {
        player = existingPlayers.results[0];
      }

      await this.insertAssociation(playerData.gameId, player.id, gameServerId);
    }
  }
}
