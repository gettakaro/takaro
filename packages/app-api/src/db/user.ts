import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { Model } from 'objection';
import { CapabilityModel, RoleModel, ROLE_TABLE_NAME } from './role.js';
import { errors } from '@takaro/util';
import { ITakaroRepo } from './base.js';
import {
  UserOutputDTO,
  UserCreateInputDTO,
  UserUpdateDTO,
  UserOutputWithRolesDTO,
} from '../service/UserService.js';

const TABLE_NAME = 'users';
const ROLE_ON_USER_TABLE_NAME = 'roleOnUser';

export class UserModel extends TakaroModel {
  static tableName = TABLE_NAME;
  name!: string;

  idpId: string;

  static relationMappings = {
    roles: {
      relation: Model.ManyToManyRelation,
      modelClass: RoleModel,
      join: {
        from: `${TABLE_NAME}.id`,
        through: {
          from: `${ROLE_ON_USER_TABLE_NAME}.userId`,
          to: `${ROLE_ON_USER_TABLE_NAME}.roleId`,
        },
        to: `${ROLE_TABLE_NAME}.id`,
      },
    },
  };
}

export interface IUserFindOneOutput extends UserModel {
  roles: Array<RoleModel & { capabilities: CapabilityModel[] }>;
}

export class UserRepo extends ITakaroRepo<
  UserModel,
  UserOutputDTO,
  UserCreateInputDTO,
  UserUpdateDTO
> {
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
      extend: ['roles.capabilities'],
    }).build(query);

    return {
      total: result.total,
      results: await Promise.all(
        result.results.map((item) =>
          new UserOutputWithRolesDTO().construct(item)
        )
      ),
    };
  }

  async findOne(id: string): Promise<UserOutputWithRolesDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id).withGraphJoined('roles.capabilities');

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

  async update(
    id: string,
    data: UserUpdateDTO
  ): Promise<UserOutputWithRolesDTO> {
    const { query } = await this.getModel();
    const item = await query
      .updateAndFetchById(id, data.toJSON())
      .returning('*');
    return this.findOne(item.id);
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    const { model } = await this.getModel();
    await model.relatedQuery('roles').for(userId).relate(roleId);
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    const { model } = await this.getModel();
    await model
      .relatedQuery('roles')
      .for(userId)
      .unrelate()
      .where('roleId', roleId);
  }

  async NOT_DOMAIN_SCOPED_resolveDomainByEmail(email: string): Promise<string> {
    const { model } = await this.getModel();

    const data = await model
      .query()
      .select('domain')
      .where('email', email)
      .first();

    if (!data) {
      throw new errors.NotFoundError(`User with email ${email} not found`);
    }

    return data.domain;
  }
}
