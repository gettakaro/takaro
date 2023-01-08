import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { Model } from 'objection';
import { errors } from '@takaro/util';
import { ITakaroRepo } from './base';
import { FUNCTION_TABLE_NAME } from './function';
import { GameEvents } from '@takaro/gameserver';
import {
  HookCreateDTO,
  HookOutputDTO,
  HookUpdateDTO,
} from '../service/HookService';

export const HOOKS_TABLE_NAME = 'hooks';

export class HookModel extends TakaroModel {
  static tableName = HOOKS_TABLE_NAME;
  name!: string;
  enabled!: boolean;
  regex!: string;
  eventType!: GameEvents;

  functionId: string;

  static get relationMappings() {
    return {
      function: {
        relation: Model.BelongsToOneRelation,
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        modelClass: require('./function').FunctionModel,
        join: {
          from: `${HOOKS_TABLE_NAME}.functionId`,
          to: `${FUNCTION_TABLE_NAME}.id`,
        },
      },
    };
  }
}

export class HookRepo extends ITakaroRepo<
  HookModel,
  HookOutputDTO,
  HookCreateDTO,
  HookUpdateDTO
> {
  constructor(public readonly domainId: string) {
    super(domainId);
  }

  async getModel() {
    const knex = await this.getKnex();
    const model = HookModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }

  async find(filters: ITakaroQuery<HookOutputDTO>) {
    const { query } = await this.getModel();
    const result = await new QueryBuilder<HookModel, HookOutputDTO>({
      ...filters,
      extend: ['function'],
    }).build(query);
    return {
      total: result.total,
      results: result.results.map((item) => new HookOutputDTO(item)),
    };
  }

  async findOne(id: string): Promise<HookOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id).withGraphJoined('function');

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    return new HookOutputDTO(data);
  }

  async create(item: HookCreateDTO): Promise<HookOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.insert({
      ...item.toJSON(),
      domain: this.domainId,
    });

    if (item.function) {
      await this.assign(data.id, item.function);
    }

    return this.findOne(data.id);
  }

  async delete(id: string): Promise<boolean> {
    const { query } = await this.getModel();
    const data = await query.deleteById(id);
    return !!data;
  }

  async update(id: string, data: HookUpdateDTO): Promise<HookOutputDTO> {
    const { query } = await this.getModel();
    const item = await query
      .updateAndFetchById(id, data.toJSON())
      .withGraphFetched('function');

    return new HookOutputDTO(item);
  }

  async assign(id: string, functionId: string) {
    const { query } = await this.getModel();
    await query.updateAndFetchById(id, { functionId });
  }
}
