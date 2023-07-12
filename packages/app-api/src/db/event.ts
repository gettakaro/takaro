import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { errors, traceableClass } from '@takaro/util';
import { ITakaroRepo } from './base.js';
import { EventCreateDTO, EventOutputDTO, EventUpdateDTO } from '../service/EventService.js';

export const EVENT_TABLE_NAME = 'events';

export class EventModel extends TakaroModel {
  static tableName = EVENT_TABLE_NAME;

  eventName: string;

  moduleId: string;
  playerId: string;
  gameserverId: string;

  meta: Record<string, string>;
}

@traceableClass('repo:event')
export class EventRepo extends ITakaroRepo<EventModel, EventOutputDTO, EventCreateDTO, EventUpdateDTO> {
  constructor(public readonly domainId: string) {
    super(domainId);
  }

  async getModel() {
    const knex = await this.getKnex();
    const model = EventModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }

  async find(filters: ITakaroQuery<EventOutputDTO>) {
    const { query } = await this.getModel();
    const result = await new QueryBuilder<EventModel, EventOutputDTO>(filters).build(query);
    return {
      total: result.total,
      results: await Promise.all(result.results.map((item) => new EventOutputDTO().construct(item))),
    };
  }

  async findOne(id: string): Promise<EventOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id);

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    return new EventOutputDTO().construct(data);
  }

  async create(item: EventCreateDTO): Promise<EventOutputDTO> {
    const { query } = await this.getModel();
    const data = await query
      .insert({
        ...item.toJSON(),
        domain: this.domainId,
      })
      .returning('*');
    return new EventOutputDTO().construct(data);
  }

  async delete(): Promise<boolean> {
    throw new errors.BadRequestError('Events cannot be deleted');
  }

  async update(): Promise<EventOutputDTO> {
    throw new errors.BadRequestError('Events cannot be updated');
  }
}
