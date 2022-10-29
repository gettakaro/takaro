import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { errors } from '@takaro/logger';
import _ from 'lodash';
import { Model } from 'objection';
import {
  CAPABILITIES,
  RoleCreateInputDTO,
  RoleOutputDTO,
  RoleUpdateInputDTO,
} from '../service/RoleService';
import { ITakaroRepo } from './base';

export const ROLE_TABLE_NAME = 'roles';
const CAPABILITY_ON_ROLE_TABLE_NAME = 'capabilityOnRole';

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

export class RoleRepo extends ITakaroRepo<
  RoleModel,
  RoleOutputDTO,
  RoleCreateInputDTO,
  RoleUpdateInputDTO
> {
  constructor(public readonly domainId: string) {
    super(domainId);
  }

  async getModel() {
    const knex = await this.getKnex();
    return RoleModel.bindKnex(knex);
  }

  async find(filters: ITakaroQuery<RoleOutputDTO>) {
    const model = await this.getModel();
    const result = await new QueryBuilder<RoleModel, RoleOutputDTO>({
      ...filters,
      extend: ['capabilities'],
    }).build(model.query());
    return {
      total: result.total,
      results: result.results.map((item) => new RoleOutputDTO(item)),
    };
  }

  async findOne(id: string): Promise<RoleOutputDTO> {
    const model = await this.getModel();
    const data = await model
      .query()
      .findById(id)
      .withGraphJoined('capabilities');

    if (!data) {
      throw new errors.NotFoundError();
    }

    return new RoleOutputDTO(data);
  }

  async create(item: RoleCreateInputDTO): Promise<RoleOutputDTO> {
    const model = await this.getModel();
    const data = await model
      .query()
      .insert(_.omit(item.toJSON(), 'capabilities'))
      .returning('*');
    return new RoleOutputDTO(data);
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

  async update(id: string, data: RoleUpdateInputDTO): Promise<RoleOutputDTO> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const model = await this.getModel();
    await model
      .query()
      .updateAndFetchById(id, _.omit(data.toJSON(), 'capabilities'))
      .returning('*');
    const item = await this.findOne(id);
    return item;
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
