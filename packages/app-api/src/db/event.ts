import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { errors, traceableClass } from '@takaro/util';
import { ITakaroRepo } from './base.js';
import { EVENT_TYPES, EventCreateDTO, EventOutputDTO, EventUpdateDTO } from '../service/EventService.js';
import { MODULE_TABLE_NAME, ModuleModel } from './module.js';
import { Model } from 'objection';
import { GAMESERVER_TABLE_NAME, GameServerModel } from './gameserver.js';
import { PLAYER_TABLE_NAME, PlayerModel } from './player.js';
import { USER_TABLE_NAME, UserModel } from './user.js';

export const EVENT_TABLE_NAME = 'events';

export class EventModel extends TakaroModel {
  static tableName = EVENT_TABLE_NAME;

  eventName: EVENT_TYPES;

  moduleId: string;
  playerId: string;
  userId: string;
  gameserverId: string;

  meta: Record<string, string>;

  static get relationMappings() {
    return {
      module: {
        relation: Model.BelongsToOneRelation,
        modelClass: ModuleModel,
        join: {
          from: `${EVENT_TABLE_NAME}.moduleId`,
          to: `${MODULE_TABLE_NAME}.id`,
        },
      },
      gameServer: {
        relation: Model.BelongsToOneRelation,
        modelClass: GameServerModel,
        join: {
          from: `${EVENT_TABLE_NAME}.gameserverId`,
          to: `${GAMESERVER_TABLE_NAME}.id`,
        },
      },
      player: {
        relation: Model.BelongsToOneRelation,
        modelClass: PlayerModel,
        join: {
          from: `${EVENT_TABLE_NAME}.playerId`,
          to: `${PLAYER_TABLE_NAME}.id`,
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: `${EVENT_TABLE_NAME}.userId`,
          to: `${USER_TABLE_NAME}.id`,
        },
      },
    };
  }
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
