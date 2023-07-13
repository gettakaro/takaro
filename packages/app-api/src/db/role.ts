import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { errors, traceableClass } from '@takaro/util';
import { omit } from 'lodash-es';
import { Model } from 'objection';
import { RoleCreateInputDTO, RoleOutputDTO, RoleUpdateInputDTO, PermissionOutputDTO } from '../service/RoleService.js';
import { ITakaroRepo } from './base.js';
import { PERMISSIONS } from '@takaro/auth';
import { UserRepo } from './user.js';
import { PlayerRepo } from './player.js';

export const ROLE_TABLE_NAME = 'roles';
const PERMISSION_ON_ROLE_TABLE_NAME = 'permissionOnRole';

export class PermissionModel extends TakaroModel {
  static tableName = PERMISSION_ON_ROLE_TABLE_NAME;
  permission!: PERMISSIONS;
  roleId!: string;
}

export class RoleModel extends TakaroModel {
  static tableName = ROLE_TABLE_NAME;
  name!: string;

  permissions!: PermissionModel[];

  static relationMappings = {
    permissions: {
      relation: Model.HasManyRelation,
      modelClass: PermissionModel,
      join: {
        from: `${ROLE_TABLE_NAME}.id`,
        to: `${PERMISSION_ON_ROLE_TABLE_NAME}.roleId`,
      },
    },
  };
}

@traceableClass('repo:role')
export class RoleRepo extends ITakaroRepo<RoleModel, RoleOutputDTO, RoleCreateInputDTO, RoleUpdateInputDTO> {
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

    return new RoleOutputDTO().construct({
      ...data,
      permissions: await Promise.all(data.permissions?.map((c) => new PermissionOutputDTO().construct(c))),
    });
  }

  async find(filters: ITakaroQuery<RoleOutputDTO>) {
    const { query } = await this.getModel();
    const result = await new QueryBuilder<RoleModel, RoleOutputDTO>({
      ...filters,
      extend: ['permissions'],
    }).build(query);
    return {
      total: result.total,
      results: await this.transformToDTO(result.results),
    };
  }

  async findOne(id: string): Promise<RoleOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id).withGraphJoined('permissions');

    if (!data) {
      throw new errors.NotFoundError();
    }

    return this.transformToDTO(data);
  }

  async create(item: RoleCreateInputDTO): Promise<RoleOutputDTO> {
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

  async addPermissionToRole(roleId: string, permission: PERMISSIONS) {
    return PermissionModel.bindKnex(await this.getKnex())
      .query()
      .insert({
        roleId,
        permission,
        domain: this.domainId,
      });
  }

  async removePermissionFromRole(roleId: string, permission: PERMISSIONS) {
    return PermissionModel.bindKnex(await this.getKnex())
      .query()
      .modify('domainScoped', this.domainId)
      .where({
        roleId,
        permission,
      })
      .del();
  }

  async assignRoleToUser(userId: string, roleId: string) {
    const userRepo = new UserRepo(this.domainId);
    await userRepo.assignRole(userId, roleId);
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    const userRepo = new UserRepo(this.domainId);
    await userRepo.removeRole(userId, roleId);
  }

  async assignRoleToPlayer(playerId: string, roleId: string) {
    const playerRepo = new PlayerRepo(this.domainId);
    await playerRepo.assignRole(playerId, roleId);
  }

  async removeRoleFromPlayer(playerId: string, roleId: string) {
    const playerRepo = new PlayerRepo(this.domainId);
    await playerRepo.removeRole(playerId, roleId);
  }
}
