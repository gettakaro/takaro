import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { errors, traceableClass } from '@takaro/util';
import { ITakaroRepo } from './base.js';
import { EventCreateDTO, EventOutputDTO, EventTypes, EventUpdateDTO } from '../service/EventService.js';
import { MODULE_TABLE_NAME, ModuleModel } from './module.js';
import { Model, QueryBuilder as ObjQueryBuilder } from 'objection';
import { GAMESERVER_TABLE_NAME, GameServerModel } from './gameserver.js';
import { PLAYER_TABLE_NAME, PlayerModel } from './player.js';
import { USER_TABLE_NAME, UserModel } from './user.js';

export const EVENT_TABLE_NAME = 'events';

type Operator = '=' | '!=' | '>' | '<' | 'array_contains';
type LogicalOperator = 'AND' | 'OR';

export interface Filter {
  field: string;
  operator: Operator;
  value: any;
}

export interface FilterGroup {
  logicalOperator: LogicalOperator;
  filters: (Filter | FilterGroup)[];
}

export class EventModel extends TakaroModel {
  static tableName = EVENT_TABLE_NAME;

  eventName: EventTypes;

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
      results: await Promise.all(result.results.map((item) => new EventOutputDTO(item))),
    };
  }

  async findOne(id: string): Promise<EventOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id);

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    return new EventOutputDTO(data);
  }

  async create(item: EventCreateDTO): Promise<EventOutputDTO> {
    const { query } = await this.getModel();
    const data = await query
      .insert({
        ...item.toJSON(),
        domain: this.domainId,
      })
      .returning('*');
    return new EventOutputDTO(data);
  }

  async delete(): Promise<boolean> {
    throw new errors.BadRequestError('Events cannot be deleted');
  }

  async update(): Promise<EventOutputDTO> {
    throw new errors.BadRequestError('Events cannot be updated');
  }

  /**
   * Search events based on metadata filters.
   * Beware: arbitrary JSON queries can be slow and inefficient. Prefer using specific fields and indexes where possible.
   * @param filters - Array of filters and filter groups
   * @returns Promise resolving to the search results
   */
  async metadataSearch(filters: ITakaroQuery<EventOutputDTO>, metaFilters: (Filter | FilterGroup)[]) {
    if (metaFilters.length === 0) {
      return [];
    }

    const { query } = await this.getModel();

    metaFilters.forEach((filter) => {
      this.applyFilter(query, filter);
    });

    const result = await new QueryBuilder<EventModel, EventOutputDTO>(filters).build(query);

    return {
      total: result.total,
      results: await Promise.all(result.results.map((item) => new EventOutputDTO(item))),
    };
  }

  /**
   * Apply a single filter or filter group to the query.
   * @param query - Knex query builder instance
   * @param filter - Single filter or filter group
   */
  private applyFilter(query: ObjQueryBuilder<EventModel, EventModel[]>, filter: Filter | FilterGroup) {
    if ('logicalOperator' in filter) {
      const { logicalOperator, filters } = filter;
      query[logicalOperator === 'AND' ? 'andWhere' : 'orWhere']((qb) => {
        filters.forEach((subFilter) => this.applyFilter(qb, subFilter));
      });
    } else {
      const { field, operator, value } = filter;

      // Join with -> but last needs to be ->>
      // 	AND (meta -> 'result' ->> 'success'  = 'false')
      function buildJsonPath(parts: string) {
        const fields = parts.split('.');
        const allButLast = fields.slice(0, -1).map((f) => `'${f}'`);
        const last = `'${fields[fields.length - 1]}'`;
        return `meta -> ${allButLast.join('->')} ->> ${last}`;
      }

      const jsonPath = buildJsonPath(field);

      switch (operator) {
        case '=':
          query.whereRaw(`${jsonPath} = ?`, [value]);
          break;
        case '!=':
          query.whereRaw(`${jsonPath} <> ?`, [value]);
          break;
        case '>':
          query.whereRaw(`(${jsonPath})::numeric > ?`, [value]);
          break;
        case '<':
          query.whereRaw(`(${jsonPath})::numeric < ?`, [value]);
          break;
        case 'array_contains':
          query.whereRaw(`? = ANY (jsonb_array_elements_text(meta->'${field}'))`, [value]);
          break;
        default:
          throw new Error(`Unknown operator: ${operator} for field: ${field}`);
      }
    }
  }

  async deleteOldEvents(olderThan: string) {
    const { query } = await this.getModel();
    return query.where('createdAt', '<', olderThan).delete();
  }
}
