import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { errors } from '@takaro/logger';
import { ITakaroRepo } from './base';
import { Model } from 'objection';
import { CRONJOB_TABLE_NAME } from './cronjob';
import {
  FunctionCreateDTO,
  FunctionOutputDTO,
  FunctionUpdateDTO,
} from '../service/FunctionService';

export const FUNCTION_TABLE_NAME = 'functions';

export const FUNCTIONS_ASSIGNMENT_TABLE_NAME = 'functionAssignments';

export enum ItemsThatCanBeAssignedAFunction {
  CRONJOB = 'cronjob',
  HOOK = 'hook',
  COMMAND = 'command',
}

export class FunctionAssignmentModel extends TakaroModel {
  static tableName = FUNCTIONS_ASSIGNMENT_TABLE_NAME;

  function!: string;
  cronJob!: string;
  command!: string;
  hook!: string;
}

export class FunctionModel extends TakaroModel {
  static tableName = FUNCTION_TABLE_NAME;
  code!: string;

  static relationMappings = {
    cronJob: {
      relation: Model.ManyToManyRelation,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      modelClass: require('./cronjob').CronJobModel,
      join: {
        from: `${FUNCTION_TABLE_NAME}.id`,
        through: {
          from: `${FUNCTIONS_ASSIGNMENT_TABLE_NAME}.function`,
          to: `${FUNCTIONS_ASSIGNMENT_TABLE_NAME}.cronJob`,
        },
        to: `${CRONJOB_TABLE_NAME}.id`,
      },
    },
  };
}

export class FunctionRepo extends ITakaroRepo<
  FunctionModel,
  FunctionOutputDTO,
  FunctionCreateDTO,
  FunctionUpdateDTO
> {
  constructor(public readonly domainId: string) {
    super(domainId);
  }

  async getModel() {
    const knex = await this.getKnex();
    return FunctionModel.bindKnex(knex);
  }

  async find(filters: ITakaroQuery<FunctionOutputDTO>) {
    const model = await this.getModel();
    const result = await new QueryBuilder<FunctionModel, FunctionOutputDTO>(
      filters
    ).build(model.query());
    return {
      total: result.total,
      results: result.results.map((item) => new FunctionOutputDTO(item)),
    };
  }

  async findOne(id: string): Promise<FunctionOutputDTO> {
    const model = await this.getModel();
    const data = await model.query().findById(id);

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    return new FunctionOutputDTO(data);
  }

  async create(item: FunctionCreateDTO): Promise<FunctionOutputDTO> {
    const model = await this.getModel();
    const data = await model.query().insert(item.toJSON()).returning('*');
    return new FunctionOutputDTO(data);
  }

  async delete(id: string): Promise<boolean> {
    const model = await this.getModel();
    const data = await model.query().deleteById(id);
    return !!data;
  }

  async update(
    id: string,
    data: FunctionUpdateDTO
  ): Promise<FunctionOutputDTO> {
    const model = await this.getModel();
    const result = await model
      .query()
      .updateAndFetchById(id, data.toJSON())
      .returning('*');
    return new FunctionOutputDTO(result);
  }

  async assign(
    type: ItemsThatCanBeAssignedAFunction,
    itemId: string,
    functionId: string
  ) {
    const knex = await this.getKnex();
    const functionAssignmentModel = FunctionAssignmentModel.bindKnex(knex);

    switch (type) {
      case ItemsThatCanBeAssignedAFunction.CRONJOB:
        await functionAssignmentModel.query().insert({
          cronJob: itemId,
          function: functionId,
        });
        break;
      case ItemsThatCanBeAssignedAFunction.HOOK:
        await functionAssignmentModel.query().insert({
          hook: itemId,
          function: functionId,
        });
        break;
      case ItemsThatCanBeAssignedAFunction.COMMAND:
        await functionAssignmentModel.query().insert({
          command: itemId,
          function: functionId,
        });
        break;
      default:
        throw new errors.ValidationError(`Unknown type ${type}`);
        break;
    }
  }

  async unAssign(itemId: string, functionId: string) {
    const knex = await this.getKnex();
    const functionAssignmentModel = FunctionAssignmentModel.bindKnex(knex);

    return functionAssignmentModel
      .query()
      .delete()
      .where({ function: functionId })
      .andWhere({ cronJob: itemId })
      .orWhere({ command: itemId })
      .orWhere({ hook: itemId });
  }

  async getRelatedFunctions(itemId: string, onlyIds = true) {
    const knex = await this.getKnex();
    const functionAssignmentModel = FunctionAssignmentModel.bindKnex(knex);
    const functionModel = FunctionModel.bindKnex(knex);

    const data = await functionAssignmentModel
      .query()
      .orWhere({ cronJob: itemId })
      .orWhere({ command: itemId })
      .orWhere({ hook: itemId });

    const functionIds = data.map((item) => item.function);

    if (onlyIds) {
      return functionIds;
    }

    return functionModel.query().findByIds(functionIds);
  }
}
