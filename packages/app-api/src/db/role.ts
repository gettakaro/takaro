import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { errors } from '@takaro/util';
import _ from 'lodash-es';
import { Model } from 'objection';
import {
  CAPABILITIES,
  RoleCreateInputDTO,
  RoleOutputDTO,
  RoleUpdateInputDTO,
  CapabilityOutputDTO,
} from '../service/RoleService.js';
import { ITakaroRepo } from './base.js';

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
    const model = RoleModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }

  private transformToDTO(data: RoleModel): Promise<RoleOutputDTO>;
  private transformToDTO(data: RoleModel[]): Promise<RoleOutputDTO[]>;
  private async transformToDTO(
    data: RoleModel[] | RoleModel
  ): Promise<RoleOutputDTO | RoleOutputDTO[]> {
    if (Array.isArray(data)) {
      return Promise.all(
        data.map(async (item) =>
          new RoleOutputDTO().construct({
            ...item,
            capabilities: await Promise.all(
              item.capabilities?.map((c) =>
                new CapabilityOutputDTO().construct(c)
              )
            ),
          })
        )
      );
    }

    return new RoleOutputDTO().construct({
      ...data,
      capabilities: await Promise.all(
        data.capabilities?.map((c) => new CapabilityOutputDTO().construct(c))
      ),
    });
  }

  async find(filters: ITakaroQuery<RoleOutputDTO>) {
    const { query } = await this.getModel();
    const result = await new QueryBuilder<RoleModel, RoleOutputDTO>({
      ...filters,
      extend: ['capabilities'],
    }).build(query);
    return {
      total: result.total,
      results: await this.transformToDTO(result.results),
    };
  }

  async findOne(id: string): Promise<RoleOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id).withGraphJoined('capabilities');

    if (!data) {
      throw new errors.NotFoundError();
    }

    return this.transformToDTO(data);
  }

  async create(item: RoleCreateInputDTO): Promise<RoleOutputDTO> {
    const { query } = await this.getModel();
    const data = await query
      .insert({
        ..._.omit(item.toJSON(), 'capabilities'),
        domain: this.domainId,
      })
      .returning('*');
    return this.transformToDTO(data);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const { query } = await this.getModel();
    const data = await query.deleteById(id);

    if (data === 0) {
      throw new errors.NotFoundError();
    }

    return !!data;
  }

  async update(id: string, data: RoleUpdateInputDTO): Promise<RoleOutputDTO> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const { query } = await this.getModel();
    await query
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
        domain: this.domainId,
      });
  }

  async removeCapabilityFromRole(roleId: string, capability: CAPABILITIES) {
    return CapabilityModel.bindKnex(await this.getKnex())
      .query()
      .modify('domainScoped', this.domainId)
      .where({
        roleId,
        capability,
      })
      .del();
  }
}
