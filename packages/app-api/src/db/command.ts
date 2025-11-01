import { TakaroModel, QueryBuilder } from '@takaro/db';
import { Model } from 'objection';
import { errors, traceableClass, ctx } from '@takaro/util';
import { ITakaroRepo } from './base.js';
import { FUNCTION_TABLE_NAME, FunctionModel } from './function.js';
import {
  CommandArgumentCreateDTO,
  CommandArgumentOutputDTO,
  CommandArgumentUpdateDTO,
  CommandCreateDTO,
  CommandOutputDTO,
  CommandUpdateDTO,
} from '../service/CommandService.js';
import { CommandSearchInputDTO } from '../controllers/CommandController.js';
import { PartialDeep } from 'type-fest/index.js';
import { ModuleVersion } from './module.js';

export const COMMANDS_TABLE_NAME = 'commands';
export const COMMAND_ARGUMENTS_TABLE_NAME = 'commandArguments';

export class CommandModel extends TakaroModel {
  static tableName = COMMANDS_TABLE_NAME;
  name!: string;
  trigger: string;
  helpText: string;
  description?: string;
  requiredPermissions: string[];

  functionId: string;

  static get relationMappings() {
    return {
      function: {
        relation: Model.BelongsToOneRelation,
        modelClass: FunctionModel,
        join: {
          from: `${COMMANDS_TABLE_NAME}.functionId`,
          to: `${FUNCTION_TABLE_NAME}.id`,
        },
      },
      arguments: {
        relation: Model.HasManyRelation,
        modelClass: CommandArgumentModel,
        join: {
          from: `${COMMANDS_TABLE_NAME}.id`,
          to: `${COMMAND_ARGUMENTS_TABLE_NAME}.commandId`,
        },
      },
      version: {
        relation: Model.BelongsToOneRelation,
        modelClass: ModuleVersion,
        join: {
          from: `${COMMANDS_TABLE_NAME}.versionId`,
          to: `${ModuleVersion.tableName}.id`,
        },
      },
    };
  }
}

export class CommandArgumentModel extends TakaroModel {
  static tableName = COMMAND_ARGUMENTS_TABLE_NAME;
  name!: string;
  type: string;
  helpText: string;
  defaultValue: string;
  commandId: string;

  static get relationMappings() {
    return {
      command: {
        relation: Model.BelongsToOneRelation,
        modelClass: CommandModel,
        join: {
          from: `${COMMAND_ARGUMENTS_TABLE_NAME}.commandId`,
          to: `${COMMANDS_TABLE_NAME}.id`,
        },
      },
    };
  }
}
@traceableClass('repo:command')
export class CommandRepo extends ITakaroRepo<CommandModel, CommandOutputDTO, CommandCreateDTO, CommandUpdateDTO> {
  constructor(public readonly domainId: string) {
    super(domainId);
  }

  async getModel() {
    const knex = await this.getKnex();
    const model = CommandModel.bindKnex(knex);
    const argumentModel = CommandArgumentModel.bindKnex(knex);

    const query = ctx.transaction ? model.query(ctx.transaction) : model.query();

    const argumentQuery = ctx.transaction ? argumentModel.query(ctx.transaction) : argumentModel.query();

    return {
      model,
      query: query.modify('domainScoped', this.domainId),
      argumentModel,
      argumentQuery: argumentQuery.modify('domainScoped', this.domainId),
      knex,
    };
  }

  async find(filters: PartialDeep<CommandSearchInputDTO>) {
    const { query } = await this.getModel();
    const qry = new QueryBuilder<CommandModel, CommandOutputDTO>({
      ...filters,
      extend: ['function', 'arguments'],
    }).build(query);

    if (filters.filters?.moduleId) {
      const moduleIds = filters.filters.moduleId as string[];
      qry.innerJoinRelated('version').whereIn('version.moduleId', moduleIds);
    }

    const result = await qry;

    return {
      total: result.total,
      results: await Promise.all(result.results.map((item) => new CommandOutputDTO(item))),
    };
  }

  async findOne(id: string): Promise<CommandOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id).withGraphJoined('function').withGraphJoined('arguments');

    if (!data) {
      throw new errors.NotFoundError(`Command with id ${id} not found`);
    }

    return new CommandOutputDTO(data);
  }

  async create(item: CommandCreateDTO): Promise<CommandOutputDTO> {
    const { query } = await this.getModel();
    const toInsert = item.toJSON();
    if (!toInsert.requiredPermissions) toInsert.requiredPermissions = [];
    toInsert.requiredPermissions = JSON.stringify(toInsert.requiredPermissions);
    const data = await query.insert({
      ...toInsert,
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
    const toUpdate = data.toJSON();
    if (!toUpdate.requiredPermissions) toUpdate.requiredPermissions = [];
    toUpdate.requiredPermissions = JSON.stringify(toUpdate.requiredPermissions);
    const item = await query.updateAndFetchById(id, toUpdate).withGraphFetched('function');

    return new CommandOutputDTO(item);
  }

  async assign(id: string, functionId: string) {
    const { query } = await this.getModel();
    await query.updateAndFetchById(id, { functionId });
  }

  async getTriggeredCommands(input: string, gameServerId: string) {
    const { query } = await this.getModel();
    const knex = await this.getKnex();
    const lowerCaseInput = input.toLowerCase();

    const commandIds: string[] = (
      await query
        .select('commands.id as commandId')
        .innerJoin('functions', 'commands.functionId', 'functions.id')
        .innerJoin('moduleVersions', 'commands.versionId', 'moduleVersions.id')
        .innerJoin('moduleInstallations', 'moduleInstallations.versionId', 'moduleVersions.id')
        .innerJoin('gameservers', 'moduleInstallations.gameserverId', 'gameservers.id')
        .where('gameservers.id', gameServerId)
        .andWhere(function () {
          this.whereRaw('LOWER("commands"."trigger") = ?', [lowerCaseInput]).orWhereExists(function () {
            this.select(knex.raw('1'))
              .from(
                knex.raw('jsonb_each("moduleInstallations"."systemConfig" -> \'commands\') as cmds(command, details)'),
              )
              .whereRaw('cmds.command = "commands"."name"')
              .andWhereRaw(
                `EXISTS (
                    SELECT 1 FROM jsonb_array_elements_text(cmds.details -> 'aliases') AS alias
                    WHERE LOWER(alias) = ?
                  )`,
                [lowerCaseInput],
              );
          });
        })
    )
      // @ts-expect-error Knex is confused because we start from the 'normal' query object
      // but we create a query that does NOT produce a CommandModel
      .map((x) => x.commandId);

    return Promise.all(commandIds.map((commandId) => this.findOne(commandId)));
  }

  async getAllForGameServer(gameServerId: string): Promise<Array<{ trigger: string; aliases: string[] }>> {
    const { query } = await this.getModel();
    const knex = await this.getKnex();

    const rawResults: Array<{ trigger: string; aliases: string }> = (await query
      .select(
        'commands.trigger',
        knex.raw(`
          COALESCE(
            (SELECT jsonb_agg(alias)
             FROM jsonb_array_elements_text(
               COALESCE(
                 ("moduleInstallations"."systemConfig" -> 'commands' -> "commands"."name" -> 'aliases')::jsonb,
                 '[]'::jsonb
               )
             ) AS alias),
            '[]'::jsonb
          ) as aliases
        `),
      )
      .innerJoin('functions', 'commands.functionId', 'functions.id')
      .innerJoin('moduleVersions', 'commands.versionId', 'moduleVersions.id')
      .innerJoin('moduleInstallations', 'moduleInstallations.versionId', 'moduleVersions.id')
      .innerJoin('gameservers', 'moduleInstallations.gameserverId', 'gameservers.id')
      .where('gameservers.id', gameServerId)) as any;

    return rawResults.map((row) => ({
      trigger: row.trigger,
      aliases:
        typeof row.aliases === 'string' && row.aliases.trim() !== ''
          ? JSON.parse(row.aliases)
          : Array.isArray(row.aliases)
            ? row.aliases
            : [],
    }));
  }

  async getArgument(argumentId: string) {
    const { argumentQuery } = await this.getModel();
    const item = await argumentQuery.findById(argumentId);
    return new CommandArgumentOutputDTO(item);
  }

  async createArgument(commandId: string, data: CommandArgumentCreateDTO) {
    const { argumentQuery } = await this.getModel();
    const toInsert = data.toJSON();
    delete toInsert.id;
    const item = await argumentQuery.insert({
      ...toInsert,
      commandId,
      domain: this.domainId,
    });
    return this.getArgument(item.id);
  }

  async updateArgument(argumentId: string, data: CommandArgumentUpdateDTO) {
    const { argumentQuery } = await this.getModel();
    const item = await argumentQuery.updateAndFetchById(argumentId, data.toJSON());
    return this.getArgument(item.id);
  }

  async deleteArgument(argumentId: string) {
    const { argumentQuery } = await this.getModel();
    const item = await argumentQuery.deleteById(argumentId);
    return !!item;
  }
}
