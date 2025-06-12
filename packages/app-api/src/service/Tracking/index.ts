import { traceableClass, errors } from '@takaro/util';
import { TakaroService } from '../Base.js';
import { PaginatedOutput, voidDTO } from '../../db/base.js';
import { PlayerLocationTrackingModel, TrackingRepo } from '../../db/tracking.js';
import {
  BoundingBoxSearchInputDTO,
  PlayerLocationOutputDTO,
  PlayerMovementHistoryInputDTO,
  RadiusSearchInputDTO,
} from './dto.js';
import { ITakaroQuery } from '@takaro/db';

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

  async getPlayerMovementHistory(input: PlayerMovementHistoryInputDTO): Promise<PlayerLocationOutputDTO[]> {
    return this.repo.getPlayerMovementHistory(input);
  }

  async getBoundingBoxPlayers(input: BoundingBoxSearchInputDTO): Promise<PlayerLocationOutputDTO[]> {
    return this.repo.getBoundingBoxPlayers(input);
  }

  async getRadiusPlayers(input: RadiusSearchInputDTO): Promise<PlayerLocationOutputDTO[]> {
    return this.repo.getRadiusPlayers(input);
  }
}
