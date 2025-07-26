import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { Model } from 'objection';
import { errors, traceableClass, ctx } from '@takaro/util';
import { ITakaroRepo } from './base.js';
import { FUNCTION_TABLE_NAME, FunctionModel } from './function.js';
import { EventTypes } from '@takaro/modules';
import { HookCreateDTO, HookOutputDTO, HookUpdateDTO } from '../service/HookService.js';
import { ModuleVersion } from './module.js';

export const HOOKS_TABLE_NAME = 'hooks';

export class HookModel extends TakaroModel {
  static tableName = HOOKS_TABLE_NAME;
  name!: string;
  regex!: string;
  eventType!: EventTypes;
  description?: string;

  functionId: string;

  static get relationMappings() {
    return {
      function: {
        relation: Model.BelongsToOneRelation,
        modelClass: FunctionModel,
        join: {
          from: `${HOOKS_TABLE_NAME}.functionId`,
          to: `${FUNCTION_TABLE_NAME}.id`,
        },
      },
      version: {
        relation: Model.BelongsToOneRelation,
        modelClass: ModuleVersion,
        join: {
          from: `${HookModel.tableName}.versionId`,
          to: `${ModuleVersion.tableName}.id`,
        },
      },
    };
  }
}

@traceableClass('repo:hook')
export class HookRepo extends ITakaroRepo<HookModel, HookOutputDTO, HookCreateDTO, HookUpdateDTO> {
  constructor(public readonly domainId: string) {
    super(domainId);
  }

  async getModel() {
    const knex = await this.getKnex();
    const model = HookModel.bindKnex(knex);

    // Use transaction from context if available
    const query = ctx.transaction ? model.query(ctx.transaction) : model.query();

    return {
      model,
      query: query.modify('domainScoped', this.domainId),
      knex,
    };
  }

  async find(filters: ITakaroQuery<HookOutputDTO>) {
    const { query } = await this.getModel();
    const qry = new QueryBuilder<HookModel, HookOutputDTO>({
      ...filters,
      extend: ['function'],
    }).build(query);

    if (filters.filters?.moduleId) {
      const moduleIds = filters.filters.moduleId as string[];
      qry.innerJoinRelated('version').whereIn('version.moduleId', moduleIds);
    }
    const result = await qry;

    return {
      total: result.total,
      results: await Promise.all(result.results.map((item) => new HookOutputDTO(item))),
    };
  }

  async findOne(id: string): Promise<HookOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id).withGraphJoined('function');

    if (!data) {
      throw new errors.NotFoundError(`Hook with id ${id} not found`);
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
    const item = await query.updateAndFetchById(id, data.toJSON()).withGraphFetched('function');

    return new HookOutputDTO(item);
  }

  async assign(id: string, functionId: string) {
    const { query } = await this.getModel();
    await query.updateAndFetchById(id, { functionId });
  }

  async getTriggeredHooks(eventType: EventTypes, gameServerId?: string): Promise<HookOutputDTO[]> {
    const { query } = await this.getModel();

    query
      .select('hooks.id as id')
      .innerJoin('functions', 'hooks.functionId', 'functions.id')
      .innerJoin('moduleVersions', 'hooks.versionId', 'moduleVersions.id')
      .innerJoin('moduleInstallations', 'moduleInstallations.versionId', 'moduleVersions.id')
      .innerJoin('gameservers', 'moduleInstallations.gameserverId', 'gameservers.id')
      .where({
        'hooks.eventType': eventType,
        'hooks.domain': this.domainId,
        ...(gameServerId ? { 'gameservers.id': gameServerId } : {}),
      });

    const results = await query;
    const hookIds = results.map((x) => x.id);
    const hooksMatchingEvent = await Promise.all(hookIds.map((id) => this.findOne(id)));
    return hooksMatchingEvent;
  }
}
