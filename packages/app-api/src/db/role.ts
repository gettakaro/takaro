import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { errors, traceableClass } from '@takaro/util';
import { omit } from 'lodash-es';
import { Model } from 'objection';
import {
  RoleOutputDTO,
  RoleUpdateInputDTO,
  PermissionOutputDTO,
  PermissionOnRoleDTO,
  PermissionInputDTO,
  ServiceRoleCreateInputDTO,
} from '../service/RoleService.js';
import { ITakaroRepo } from './base.js';

export const ROLE_TABLE_NAME = 'roles';
export const PERMISSION_ON_ROLE_TABLE_NAME = 'permissionOnRole';
export const PERMISSION_TABLE_NAME = 'permission';

export class PermissionModel extends TakaroModel {
  static tableName = PERMISSION_TABLE_NAME;
  moduleVersionId?: string;
  permission!: string;
  friendlyName!: string;
  description!: string;
  canHaveCount!: boolean;
}

export class PermissionOnRoleModel extends TakaroModel {
  static tableName = PERMISSION_ON_ROLE_TABLE_NAME;
  permission!: PermissionModel;
  permissionId: string;
  roleId!: string;
  count: number | null;

  static relationMappings = {
    permission: {
      relation: Model.BelongsToOneRelation,
      modelClass: PermissionModel,
      join: {
        from: `${PERMISSION_ON_ROLE_TABLE_NAME}.permissionId`,
        to: `${PERMISSION_TABLE_NAME}.id`,
      },
    },
  };
}

export class RoleModel extends TakaroModel {
  static tableName = ROLE_TABLE_NAME;
  name!: string;
  system: boolean;

  permissions!: PermissionOnRoleModel[];

  static relationMappings = {
    permissions: {
      relation: Model.HasManyRelation,
      modelClass: PermissionOnRoleModel,
      join: {
        from: `${ROLE_TABLE_NAME}.id`,
        to: `${PERMISSION_ON_ROLE_TABLE_NAME}.roleId`,
      },
    },
  };
}

@traceableClass('repo:role')
export class RoleRepo extends ITakaroRepo<RoleModel, RoleOutputDTO, ServiceRoleCreateInputDTO, RoleUpdateInputDTO> {
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
  private async transformToDTO(data: RoleModel[] | RoleModel): Promise<RoleOutputDTO | RoleOutputDTO[]> {
    if (Array.isArray(data)) {
      return Promise.all(data.map(async (item) => this.transformToDTO(item)));
    }

    if (!data.permissions) data.permissions = [];

    return new RoleOutputDTO({
      ...data,
      permissions: await Promise.all(
        data.permissions
          ?.sort((a, b) => {
            if (a.permission.permission < b.permission.permission) return -1;
            if (a.permission.permission > b.permission.permission) return 1;
            return 0;
          })
          .map(
            async (c) =>
              new PermissionOnRoleDTO({
                ...c,
                permission: new PermissionOutputDTO(c.permission),
                count: c.count || 0,
              }),
          ),
      ),
    });
  }

  async find(filters: ITakaroQuery<RoleOutputDTO>) {
    const { query } = await this.getModel();
    const result = await new QueryBuilder<RoleModel, RoleOutputDTO>({
      ...filters,
      extend: ['permissions.permission'],
    }).build(query);
    return {
      total: result.total,
      results: await this.transformToDTO(result.results),
    };
  }

  async findOne(id: string): Promise<RoleOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id).withGraphJoined('permissions.permission');

    if (!data) {
      throw new errors.NotFoundError();
    }

    return this.transformToDTO(data);
  }

  async create(item: ServiceRoleCreateInputDTO): Promise<RoleOutputDTO> {
    const { query } = await this.getModel();
    const data = await query
      .insert({
        ...omit(item.toJSON(), 'permissions'),
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
    await query.updateAndFetchById(id, omit(data.toJSON(), 'permissions')).returning('*');
    const item = await this.findOne(id);
    return item;
  }

  async addPermissionToRole(roleId: string, permission: PermissionInputDTO) {
    const knex = await this.getKnex();
    const permissionModel = PermissionModel.bindKnex(knex);

    const permissionRecord = await permissionModel.query().where({ id: permission.permissionId }).first();

    if (!permissionRecord) throw new errors.NotFoundError(`Permission ${permission} not found`);

    return PermissionOnRoleModel.bindKnex(await this.getKnex())
      .query()
      .insert({
        roleId,
        permissionId: permissionRecord.id,
        count: permission.count,
        domain: this.domainId,
      });
  }

  async removePermissionFromRole(roleId: string, permission: string) {
    const knex = await this.getKnex();
    const permissionModel = PermissionModel.bindKnex(knex);

    const permissionRecord = await permissionModel.query().where({ id: permission }).first();

    if (!permissionRecord) throw new errors.NotFoundError(`Permission ${permission} not found`);

    return PermissionOnRoleModel.bindKnex(await this.getKnex())
      .query()
      .modify('domainScoped', this.domainId)
      .where({
        roleId,
        permissionId: permissionRecord.id,
      })
      .del();
  }

  async permissionCodeToRecord(permissionCode: string) {
    const knex = await this.getKnex();
    const permissionModel = PermissionModel.bindKnex(knex);

    const permissionRecord = await permissionModel.query().where({ permission: permissionCode }).first();

    if (!permissionRecord) throw new errors.NotFoundError(`Permission ${permissionCode} not found`);

    return permissionRecord;
  }

  async getSystemPermissions() {
    const knex = await this.getKnex();
    const permissionModel = PermissionModel.bindKnex(knex);

    const res = await permissionModel.query().where({ moduleVersionId: null });

    return await Promise.all(res.map((c) => new PermissionOutputDTO(c)));
  }
}
