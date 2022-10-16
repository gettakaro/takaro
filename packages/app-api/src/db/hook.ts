import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { Model, PartialModelObject } from 'objection';
import { errors } from '@takaro/logger';
import { ITakaroRepo } from './base';
import {
  FUNCTIONS_ASSIGNMENT_TABLE_NAME,
  FUNCTION_TABLE_NAME,
} from './function';
import { GameEvents } from '@takaro/gameserver';

export const HOOKS_TABLE_NAME = 'hooks';

export class HookModel extends TakaroModel {
  static tableName = HOOKS_TABLE_NAME;
  name!: string;
  enabled!: boolean;
  regex!: string;
  eventType!: GameEvents;

  static get relationMappings() {
    return {
      functions: {
        relation: Model.ManyToManyRelation,
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        modelClass: require('./function').FunctionModel,
        join: {
          from: `${HOOKS_TABLE_NAME}.id`,
          through: {
            from: `${FUNCTIONS_ASSIGNMENT_TABLE_NAME}.hook`,
            to: `${FUNCTIONS_ASSIGNMENT_TABLE_NAME}.function`,
          },
          to: `${FUNCTION_TABLE_NAME}.id`,
        },
      },
    };
  }
}

export class HookRepo extends ITakaroRepo<HookModel> {
  constructor(public readonly domainId: string) {
    super(domainId);
  }

  async getModel() {
    const knex = await this.getKnex();
    return HookModel.bindKnex(knex);
  }

  async find(filters: ITakaroQuery<HookModel>) {
    const model = await this.getModel();
    return await new QueryBuilder<HookModel>({
      ...filters,
      extend: ['functions'],
    }).build(model.query());
  }

  async findOne(id: string): Promise<HookModel> {
    const model = await this.getModel();
    const data = await model.query().findById(id).withGraphJoined('functions');

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    return data;
  }

  async create(item: PartialModelObject<HookModel>): Promise<HookModel> {
    const model = await this.getModel();
    return model
      .query()
      .insert(item)
      .returning('*')
      .withGraphJoined('functions');
  }

  async delete(id: string): Promise<boolean> {
    const model = await this.getModel();
    const data = await model.query().deleteById(id);
    return !!data;
  }

  async update(
    id: string,
    data: PartialModelObject<HookModel>
  ): Promise<HookModel> {
    const model = await this.getModel();
    return model
      .query()
      .updateAndFetchById(id, data)
      .withGraphFetched('functions');
  }
}
