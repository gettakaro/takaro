import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { Model, PartialModelObject } from 'objection';
import { CapabilityModel, RoleModel, ROLE_TABLE_NAME } from './role';
import { errors } from '@takaro/logger';
import { ITakaroRepo } from './base';

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

export class UserRepo extends ITakaroRepo<UserModel> {
  constructor(public readonly domainId: string) {
    super(domainId);
  }

  async getModel() {
    const knex = await this.getKnex();
    return UserModel.bindKnex(knex);
  }

  async find(filters: ITakaroQuery<UserModel>): Promise<UserModel[]> {
    const params = new QueryBuilder(filters).build();
    const model = await this.getModel();
    return await model
      .query()
      .where(params.where)
      .withGraphJoined('roles.capabilities');
  }

  async findOne(id: string): Promise<IUserFindOneOutput> {
    const model = await this.getModel();
    const data = await model
      .query()
      .findById(id)
      .withGraphJoined('roles.capabilities');

    if (!data) {
      throw new errors.NotFoundError(`User with id ${id} not found`);
    }

    return data as IUserFindOneOutput;
  }

  async create(item: PartialModelObject<UserModel>): Promise<UserModel> {
    const model = await this.getModel();
    return model.query().insert(item).returning('*');
  }

  async delete(id: string): Promise<boolean> {
    const model = await this.getModel();
    const data = await model.query().deleteById(id);
    return !!data;
  }

  async update(
    id: string,
    data: PartialModelObject<UserModel>
  ): Promise<UserModel> {
    const model = await this.getModel();
    return model.query().updateAndFetchById(id, data).returning('*');
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
