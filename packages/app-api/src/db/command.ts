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

  functionId: string;

  static get relationMappings() {
    return {
      function: {
        relation: Model.BelongsToOneRelation,
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        modelClass: require('./function').FunctionModel,
        join: {
          from: `${COMMANDS_TABLE_NAME}.functionId`,
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
    const model = CommandModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }

  async find(filters: ITakaroQuery<CommandOutputDTO>) {
    const { query } = await this.getModel();
    const result = await new QueryBuilder<CommandModel, CommandOutputDTO>({
      ...filters,
      extend: ['function'],
    }).build(query);
    return {
      total: result.total,
      results: result.results.map((item) => new CommandOutputDTO(item)),
    };
  }

  async findOne(id: string): Promise<CommandOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id).withGraphJoined('function');

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    return new CommandOutputDTO(data);
  }

  async create(item: CommandCreateDTO): Promise<CommandOutputDTO> {
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

  async update(id: string, data: CommandUpdateDTO): Promise<CommandOutputDTO> {
    const { query } = await this.getModel();
    const item = await query
      .updateAndFetchById(id, data.toJSON())
      .withGraphFetched('function');

    return new CommandOutputDTO(item);
  }

  async assign(id: string, functionId: string) {
    const { query } = await this.getModel();
    await query.updateAndFetchById(id, { functionId });
  }

  async getTriggeredCommands(input: string, gameServerId: string) {
    const { query } = await this.getModel();

    const commandIds = (
      await query
        .select('commands.id as commandId')
        .innerJoin('functions', 'commands.functionId', 'functions.id')
        .innerJoin('modules', 'commands.moduleId', 'modules.id')
        .innerJoin(
          'moduleAssignments',
          'moduleAssignments.moduleId',
          'modules.id'
        )
        .innerJoin(
          'gameservers',
          'moduleAssignments.gameserverId',
          'gameservers.id'
        )
        .where({
          trigger: input,
          'commands.enabled': true,
          'gameservers.id': gameServerId,
        })
    )
      // @ts-expect-error TODO: Fix this
      .map((x) => x.commandId);

    return Promise.all(commandIds.map((commandId) => this.findOne(commandId)));
  }
}
