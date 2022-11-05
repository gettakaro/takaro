import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { Model } from 'objection';
import { errors } from '@takaro/util';
import { ITakaroRepo } from './base';
import { FUNCTION_TABLE_NAME } from './function';
import {
  CommandCreateDTO,
  CommandOutputDTO,
  CommandUpdateDTO,
} from '../service/CommandService';

export const COMMANDS_TABLE_NAME = 'commands';

export class CommandModel extends TakaroModel {
  static tableName = COMMANDS_TABLE_NAME;
  name!: string;
  enabled!: boolean;
  trigger: string;
  helpText: string;

  static get relationMappings() {
    return {
      function: {
        relation: Model.HasOneRelation,
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        modelClass: require('./function').FunctionModel,
        join: {
          from: `${COMMANDS_TABLE_NAME}.id`,
          to: `${FUNCTION_TABLE_NAME}.id`,
        },
      },
    };
  }
}

export class CommandRepo extends ITakaroRepo<
  CommandModel,
  CommandOutputDTO,
  CommandCreateDTO,
  CommandUpdateDTO
> {
  constructor(public readonly domainId: string) {
    super(domainId);
  }

  async getModel() {
    const knex = await this.getKnex();
    return CommandModel.bindKnex(knex);
  }

  async find(filters: ITakaroQuery<CommandOutputDTO>) {
    const model = await this.getModel();
    const result = await new QueryBuilder<CommandModel, CommandOutputDTO>({
      ...filters,
      extend: ['function'],
    }).build(model.query());
    return {
      total: result.total,
      results: result.results.map((item) => new CommandOutputDTO(item)),
    };
  }

  async findOne(id: string): Promise<CommandOutputDTO> {
    const model = await this.getModel();
    const data = await model.query().findById(id).withGraphJoined('function');

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    return new CommandOutputDTO(data);
  }

  async create(item: CommandCreateDTO): Promise<CommandOutputDTO> {
    const model = await this.getModel();
    const data = await model.query().insert(item.toJSON());

    if (item.function) {
      await this.assign(data.id, item.function);
    }

    return this.findOne(data.id);
  }

  async delete(id: string): Promise<boolean> {
    const model = await this.getModel();
    const data = await model.query().deleteById(id);
    return !!data;
  }

  async update(id: string, data: CommandUpdateDTO): Promise<CommandOutputDTO> {
    const model = await this.getModel();
    const item = await model
      .query()
      .updateAndFetchById(id, data.toJSON())
      .withGraphFetched('function');

    return new CommandOutputDTO(item);
  }

  async assign(id: string, functionId: string) {
    const model = await this.getModel();
    await model.relatedQuery('function').for(id).relate(functionId);
  }
}
