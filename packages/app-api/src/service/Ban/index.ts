import { TakaroService } from '../Base.js';
import { errors, traceableClass } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../../db/base.js';
import { BanCreateDTO, BanOutputDTO, BanUpdateDTO } from './dto.js';
import { BanModel, BanRepo } from '../../db/ban.js';

@traceableClass('service:ban')
export class BanService extends TakaroService<BanModel, BanOutputDTO, BanCreateDTO, BanUpdateDTO> {
  get repo() {
    return new BanRepo(this.domainId);
  }

  async find(filters: ITakaroQuery<BanOutputDTO>): Promise<PaginatedOutput<BanOutputDTO>> {
    const data = await this.repo.find(filters);
    return data;
  }

  async findOne(id: string): Promise<BanOutputDTO> {
    const data = await this.repo.findOne(id);
    if (!data) throw new errors.NotFoundError(`Ban with id ${id} not found`);
    return data;
  }

  async create(_item: BanCreateDTO): Promise<BanOutputDTO> {
    throw new errors.NotImplementedError();
  }

  async update(_id: string, _item: BanUpdateDTO): Promise<BanOutputDTO> {
    throw new errors.NotImplementedError();
  }

  async delete(_id: string): Promise<string> {
    throw new errors.NotImplementedError();
  }
}
