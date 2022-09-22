import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { errors } from '@takaro/logger';
import { Model, PartialModelObject } from 'objection';
import { ITakaroRepo } from './base';

export const ROLE_TABLE_NAME = 'roles';
const CAPABILITY_ON_ROLE_TABLE_NAME = 'capabilityOnRole';

export enum CAPABILITIES {
  'ROOT' = 'ROOT',
  'MANAGE_USERS' = 'MANAGE_USERS',
  'READ_USERS' = 'READ_USERS',
  'MANAGE_ROLES' = 'MANAGE_ROLES',
  'READ_ROLES' = 'READ_ROLES',
  'MANAGE_GAMESERVERS' = 'MANAGE_GAMESERVERS',
  'READ_GAMESERVERS' = 'READ_GAMESERVERS',
  'READ_FUNCTIONS' = 'READ_FUNCTIONS',
  'MANAGE_FUNCTIONS' = 'MANAGE_FUNCTIONS',
  'READ_CRONJOBS' = 'READ_CRONJOBS',
  'MANAGE_CRONJOBS' = 'MANAGE_CRONJOBS',
  'READ_MODULES' = 'READ_MODULES',
  'MANAGE_MODULES' = 'MANAGE_MODULES',
}

export class CapabilityModel extends TakaroModel {
  static tableName = CAPABILITY_ON_ROLE_TABLE_NAME;
  capability!: CAPABILITIES;
  roleId!: string;
}

export class RoleModel extends TakaroModel {
  static tableName = ROLE_TABLE_NAME;
  name!: string;

  capabilities!: CapabilityModel[];

  static relationMappings = {
    capabilities: {
      relation: Model.HasManyRelation,
      modelClass: CapabilityModel,
      join: {
        from: `${ROLE_TABLE_NAME}.id`,
        to: `${CAPABILITY_ON_ROLE_TABLE_NAME}.roleId`,
      },
    },
  };
}

export class RoleRepo extends ITakaroRepo<RoleModel> {
  constructor(public readonly domainId: string) {
    super(domainId);
  }

  async getModel() {
    const knex = await this.getKnex();
    return RoleModel.bindKnex(knex);
  }

  async find(filters: ITakaroQuery<RoleModel>): Promise<RoleModel[]> {
    const params = new QueryBuilder(filters).build();
    const model = await this.getModel();
    return await model
      .query()
      .where(params.where)
      .withGraphJoined('capabilities');
  }

  async findOne(
    id: string
  ): Promise<RoleModel & { capabilities: CapabilityModel[] }> {
    const model = await this.getModel();
    const data = await model
      .query()
      .findById(id)
      .withGraphJoined('capabilities');

    if (!data) {
      throw new errors.NotFoundError();
    }

    return data as RoleModel & { capabilities: CapabilityModel[] };
  }

  async create(item: PartialModelObject<RoleModel>): Promise<RoleModel> {
    const model = await this.getModel();
    return model.query().insert(item).returning('*');
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const model = await this.getModel();
    const data = await model.query().deleteById(id);

    if (data === 0) {
      throw new errors.NotFoundError();
    }

    return !!data;
  }

  async update(
    id: string,
    data: PartialModelObject<RoleModel>
  ): Promise<RoleModel> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const model = await this.getModel();
    await model.query().updateAndFetchById(id, data).returning('*');
    return this.findOne(id);
  }

  async addCapabilityToRole(roleId: string, capability: CAPABILITIES) {
    return CapabilityModel.bindKnex(await this.getKnex())
      .query()
      .insert({
        roleId,
        capability,
      });
  }

  async removeCapabilityFromRole(roleId: string, capability: CAPABILITIES) {
    return CapabilityModel.bindKnex(await this.getKnex())
      .query()
      .where({
        roleId,
        capability,
      })
      .del();
  }
}
