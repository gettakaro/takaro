import { TakaroService } from './Base.js';

import { PlayerModel, PlayerRepo } from '../db/player.js';
import { IsOptional, IsString } from 'class-validator';
import { TakaroDTO, TakaroModelDTO, traceableClass } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { PlayerOnGameServerService } from './PlayerOnGameserverService.js';
import { IGamePlayer } from '@takaro/modules';
import { IPlayerReferenceDTO } from '@takaro/gameserver';

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

@traceableClass('service:player')
export class PlayerService extends TakaroService<PlayerModel, PlayerOutputDTO, PlayerCreateDTO, PlayerUpdateDTO> {
  get repo() {
    return new PlayerRepo(this.domainId);
  }

  find(filters: ITakaroQuery<PlayerOutputDTO>): Promise<PaginatedOutput<PlayerOutputDTO>> {
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

  async delete(id: string) {
    await this.repo.delete(id);
    return id;
  }

  async sync(playerData: IGamePlayer, gameServerId: string) {
    const playerOnGameServerService = new PlayerOnGameServerService(this.domainId);
    const existingAssociations = await playerOnGameServerService.findAssociations(playerData.gameId);
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
}
