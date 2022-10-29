import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { NOT_DOMAIN_SCOPED_ITakaroRepo } from './base';
import { errors } from '@takaro/util';
import { TakaroDTO } from '@takaro/http';
import { IsString } from 'class-validator';

const LOGINS_TABLE_NAME = 'logins';

export class LoginOutputDTO extends TakaroDTO<LoginOutputDTO> {
  @IsString()
  id!: string;

  @IsString()
  userId!: string;

  @IsString()
  email!: string;

  @IsString()
  domain!: string;
}

export class LoginCreateDTO extends TakaroDTO<LoginCreateDTO> {
  @IsString()
  userId!: string;

  @IsString()
  domain!: string;

  @IsString()
  email!: string;
}

export class LoginUpdateDTO extends TakaroDTO<LoginUpdateDTO> {
  @IsString()
  email!: string;
}

export class LoginModel extends TakaroModel {
  static tableName = LOGINS_TABLE_NAME;
  domain!: string;
  userId!: string;
  email!: string;
}

export class LoginRepo extends NOT_DOMAIN_SCOPED_ITakaroRepo<
  LoginModel,
  LoginOutputDTO,
  LoginCreateDTO,
  LoginUpdateDTO
> {
  async getModel() {
    const knex = await this.getKnex();
    return LoginModel.bindKnex(knex);
  }

  async find(filters: ITakaroQuery<LoginOutputDTO>) {
    const model = await this.getModel();
    const result = await new QueryBuilder<LoginModel, LoginOutputDTO>(
      filters
    ).build(model.query());
    return {
      total: result.total,
      results: result.results.map((item) => new LoginOutputDTO(item)),
    };
  }

  async findOne(id: string): Promise<LoginOutputDTO> {
    const model = await this.getModel();
    const data = await model.query().findById(id);

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    return new LoginOutputDTO(data);
  }

  async create(item: LoginCreateDTO): Promise<LoginOutputDTO> {
    const model = await this.getModel();
    const data = await model.query().insert(item.toJSON()).returning('*');
    return new LoginOutputDTO(data);
  }

  async delete(id: string): Promise<boolean> {
    const model = await this.getModel();
    const data = await model.query().deleteById(id);
    return !!data;
  }

  async update(id: string, data: LoginUpdateDTO): Promise<LoginOutputDTO> {
    const model = await this.getModel();
    const item = await model
      .query()
      .updateAndFetchById(id, data.toJSON())
      .returning('*');
    return new LoginOutputDTO(item);
  }
}
