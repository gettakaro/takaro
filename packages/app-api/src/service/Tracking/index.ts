import { traceableClass, errors } from '@takaro/util';
import { TakaroService } from '../Base.js';
import { PaginatedOutput, voidDTO } from '../../db/base.js';
import { PlayerLocationTrackingModel, TrackingRepo } from '../../db/tracking.js';
import {
  BoundingBoxSearchInputDTO,
  PlayerLocationOutputDTO,
  PlayerMovementHistoryInputDTO,
  RadiusSearchInputDTO,
  PlayerInventoryOutputDTO,
  PlayerInventoryHistoryInputDTO,
  PlayersByItemInputDTO,
  PlayerItemHistoryOutputDTO,
} from './dto.js';
import { ITakaroQuery } from '@takaro/db';
import { PlayerService } from '../Player/index.js';
import { PlayerOnGameServerService } from '../PlayerOnGameserverService.js';

@traceableClass('service:tracking')
export class TrackingService extends TakaroService<
  PlayerLocationTrackingModel,
  PlayerLocationOutputDTO,
  voidDTO,
  voidDTO
> {
  get repo() {
    return new TrackingRepo(this.domainId);
  }

  async find(_filters: ITakaroQuery<PlayerLocationOutputDTO>): Promise<PaginatedOutput<PlayerLocationOutputDTO>> {
    throw new errors.NotImplementedError();
  }

  async findOne(_id: string): Promise<PlayerLocationOutputDTO> {
    throw new errors.NotImplementedError();
  }

  async create(_item: voidDTO): Promise<PlayerLocationOutputDTO> {
    throw new errors.NotImplementedError();
  }

  async update(_id: string, _item: voidDTO): Promise<PlayerLocationOutputDTO> {
    throw new errors.NotImplementedError();
  }

  async delete(_id: string): Promise<string> {
    throw new errors.NotImplementedError();
  }

  private async checkIdType(id: string): Promise<{ isPlayerId: boolean; isPogId: boolean }> {
    const playerService = new PlayerService(this.domainId);
    const pogService = new PlayerOnGameServerService(this.domainId);

    let isPlayerId = false;
    let isPogId = false;

    try {
      await playerService.findOne(id);
      isPlayerId = true;
    } catch {
      // Not a player ID
    }

    try {
      await pogService.findOne(id);
      isPogId = true;
    } catch {
      // Not a PoG ID
    }

    return { isPlayerId, isPogId };
  }

  async getPlayerMovementHistory(input: PlayerMovementHistoryInputDTO): Promise<PlayerLocationOutputDTO[]> {
    const result = await this.repo.getPlayerMovementHistory(input);

    // If no results and playerIds were provided, check if wrong ID type was used
    if (result.length === 0 && input.playerId && input.playerId.length > 0) {
      for (const id of input.playerId) {
        const { isPlayerId, isPogId } = await this.checkIdType(id);

        if (isPlayerId && !isPogId) {
          throw new errors.BadRequestError(
            `No tracking data found for ID: ${id}. This appears to be a Player ID, but this endpoint requires a PlayerOnGameserver ID. ` +
              `Please use the PlayerOnGameserver ID instead. You can find the correct ID by querying /gameservers/{gameServerId}/players/{playerId}`,
          );
        }
      }
    }

    return result;
  }

  async getBoundingBoxPlayers(input: BoundingBoxSearchInputDTO): Promise<PlayerLocationOutputDTO[]> {
    return this.repo.getBoundingBoxPlayers(input);
  }

  async getRadiusPlayers(input: RadiusSearchInputDTO): Promise<PlayerLocationOutputDTO[]> {
    return this.repo.getRadiusPlayers(input);
  }

  async getPlayerInventoryHistory(input: PlayerInventoryHistoryInputDTO): Promise<PlayerInventoryOutputDTO[]> {
    const result = await this.repo.getPlayerInventoryHistory(input);

    // If no results, check if wrong ID type was used
    if (result.length === 0) {
      const { isPlayerId, isPogId } = await this.checkIdType(input.playerId);

      if (isPlayerId && !isPogId) {
        throw new errors.BadRequestError(
          `No tracking data found for ID: ${input.playerId}. This appears to be a Player ID, but this endpoint requires a PlayerOnGameserver ID. ` +
            `Please use the PlayerOnGameserver ID instead. You can find the correct ID by querying /gameservers/{gameServerId}/players/{playerId}`,
        );
      }
    }

    return result;
  }

  async getPlayersByItem(input: PlayersByItemInputDTO): Promise<PlayerItemHistoryOutputDTO[]> {
    return this.repo.getPlayersByItem(input);
  }
}
