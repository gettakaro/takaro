import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { Model } from 'objection';
import { CapabilityModel, RoleModel, ROLE_TABLE_NAME } from './role';
import { errors } from '@takaro/util';
import { ITakaroRepo } from './base';
import {
  UserOutputDTO,
  UserCreateInputDTO,
  UserUpdateDTO,
  UserOutputWithRolesDTO,
} from '../service/UserService';

const TABLE_NAME = 'users';
const ROLE_ON_USER_TABLE_NAME = 'roleOnUser';

export class UserModel extends TakaroModel {
  static tableName = TABLE_NAME;
  name!: string;

  email!: string;
  password!: string;

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
    return UserModel.bindKnex(knex);
  }

  async find(filters: ITakaroQuery<UserOutputDTO>) {
    const model = await this.getModel();
    const result = await new QueryBuilder<UserModel, UserOutputDTO>({
      ...filters,
      extend: ['roles.capabilities'],
    }).build(model.query());

    return {
      total: result.total,
      results: result.results.map((item) => new UserOutputWithRolesDTO(item)),
    };
  }

  async findOne(id: string): Promise<UserOutputWithRolesDTO> {
    const model = await this.getModel();
    const data = await model
      .query()
      .findById(id)
      .withGraphJoined('roles.capabilities');

    if (!data) {
      throw new errors.NotFoundError(`User with id ${id} not found`);
    }

    return new UserOutputWithRolesDTO(data);
  }

  async create(data: UserCreateInputDTO): Promise<UserOutputDTO> {
    const model = await this.getModel();
    const item = await model.query().insert(data.toJSON()).returning('*');
    return new UserOutputDTO(item);
  }

  async delete(id: string): Promise<boolean> {
    const model = await this.getModel();
    const data = await model.query().deleteById(id);
    return !!data;
  }

  async update(id: string, data: UserUpdateDTO): Promise<UserOutputDTO> {
    const model = await this.getModel();
    const item = await model
      .query()
      .updateAndFetchById(id, data.toJSON())
      .returning('*');
    return new UserOutputDTO(item);
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    const model = await this.getModel();
    await model.relatedQuery('roles').for(userId).relate(roleId);
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    const model = await this.getModel();
    await model
      .relatedQuery('roles')
      .for(userId)
      .unrelate()
      .where('roleId', roleId);
  }
}
