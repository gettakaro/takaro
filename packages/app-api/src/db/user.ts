import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { Model } from 'objection';
import { PermissionOnRoleModel, ROLE_TABLE_NAME, RoleModel } from './role.js';
import { errors, traceableClass } from '@takaro/util';
import { ITakaroRepo } from './base.js';
import { UserOutputDTO, UserCreateInputDTO, UserUpdateDTO, UserOutputWithRolesDTO } from '../service/UserService.js';

export const USER_TABLE_NAME = 'users';
const ROLE_ON_USER_TABLE_NAME = 'roleOnUser';

export class RoleOnUserModel extends TakaroModel {
  static tableName = ROLE_ON_USER_TABLE_NAME;

  userId: string;
  roleId: string;
  expiresAt: string | null;

  static get relationMappings() {
    return {
      role: {
        relation: Model.BelongsToOneRelation,
        modelClass: RoleModel,
        join: {
          from: `${ROLE_ON_USER_TABLE_NAME}.roleId`,
          to: `${ROLE_TABLE_NAME}.id`,
        },
      },
    };
  }
}

export class UserModel extends TakaroModel {
  static tableName = USER_TABLE_NAME;
  name!: string;

  idpId: string;
  discordId?: string;

  static get relationMappings() {
    return {
      roles: {
        relation: Model.HasManyRelation,
        modelClass: RoleOnUserModel,
        join: {
          from: `${USER_TABLE_NAME}.id`,
          to: `${ROLE_ON_USER_TABLE_NAME}.userId`,
        },
      },
    };
  }
}

export interface IUserFindOneOutput extends UserModel {
  roles: Array<RoleModel & { permissions: PermissionOnRoleModel[] }>;
}

@traceableClass('repo:user')
export class UserRepo extends ITakaroRepo<UserModel, UserOutputDTO, UserCreateInputDTO, UserUpdateDTO> {
  constructor(public readonly domainId: string) {
    super(domainId);
  }

  async getModel() {
    const knex = await this.getKnex();
    const model = UserModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }

  async find(filters: ITakaroQuery<UserOutputDTO>) {
    const { query } = await this.getModel();
    const result = await new QueryBuilder<UserModel, UserOutputDTO>({
      ...filters,
      extend: ['roles.role.permissions.permission'],
    }).build(query);

    return {
      total: result.total,
      results: await Promise.all(result.results.map((item) => new UserOutputWithRolesDTO().construct(item))),
    };
  }

  async findOne(id: string): Promise<UserOutputWithRolesDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id).withGraphFetched('roles.role.permissions.permission');

    if (!data) {
      throw new errors.NotFoundError(`User with id ${id} not found`);
    }

    return new UserOutputWithRolesDTO().construct(data);
  }

  async create(data: UserCreateInputDTO): Promise<UserOutputWithRolesDTO> {
    const { query } = await this.getModel();
    const item = await query
      .insert({
        idpId: data.idpId,
        name: data.name,
        domain: this.domainId,
      })
      .returning('*');
    return this.findOne(item.id);
  }

  async delete(id: string): Promise<boolean> {
    const { query } = await this.getModel();
    const data = await query.deleteById(id);
    return !!data;
  }

  async update(id: string, data: UserUpdateDTO): Promise<UserOutputWithRolesDTO> {
    const { query } = await this.getModel();
    const item = await query.updateAndFetchById(id, data.toJSON()).returning('*');
    return this.findOne(item.id);
  }

  async assignRole(userId: string, roleId: string, expiresAt?: string): Promise<void> {
    const knex = await this.getKnex();
    const roleOnPlayerModel = RoleOnUserModel.bindKnex(knex);
    await roleOnPlayerModel.query().insert({
      userId,
      roleId,
      expiresAt,
    });
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    const knex = await this.getKnex();
    const roleOnPlayerModel = RoleOnUserModel.bindKnex(knex);
    await roleOnPlayerModel.query().delete().where({ userId, roleId });
  }

  async NOT_DOMAIN_SCOPED_resolveDomainByEmail(email: string): Promise<string> {
    const { model } = await this.getModel();

    const data = await model.query().select('domain').where('email', email).first();

    if (!data) {
      throw new errors.NotFoundError(`User with email ${email} not found`);
    }

    return data.domain;
  }
}
