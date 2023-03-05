import { TakaroService } from './Base.js';
import { hash, ITakaroQuery } from '@takaro/db';

import { UserModel, UserRepo } from '../db/user.js';
import {
  IsEmail,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import { TakaroDTO } from '@takaro/util';
import { RoleOutputDTO } from './RoleService.js';
import { Exclude, Type } from 'class-transformer';

export class UserOutputDTO extends TakaroDTO<UserOutputDTO> {
  @IsUUID()
  id: string;
  @IsString()
  name: string;
  @IsString()
  email: string;

  @IsString()
  @Exclude()
  password: string;
}

export class UserOutputWithRolesDTO extends UserOutputDTO {
  @Type(() => RoleOutputDTO)
  @ValidateNested()
  roles: RoleOutputDTO[];
}

export class UserCreateInputDTO extends TakaroDTO<UserCreateInputDTO> {
  @Length(3, 50)
  name: string;

  @IsEmail()
  email: string;

  // We're using Blowfish based hashing in the database, which has a max length of 72 characters
  @Length(8, 70)
  password: string;
}

export class UserUpdateDTO extends TakaroDTO<UserUpdateDTO> {
  @Length(3, 50)
  name: string;
}

export class UserService extends TakaroService<
  UserModel,
  UserOutputDTO,
  UserCreateInputDTO,
  UserUpdateDTO
> {
  get repo() {
    return new UserRepo(this.domainId);
  }

  find(filters: ITakaroQuery<UserOutputDTO>) {
    return this.repo.find(filters);
  }

  findOne(id: string) {
    return this.repo.findOne(id);
  }

  async create(user: UserCreateInputDTO): Promise<UserOutputDTO> {
    user.password = await hash(user.password);
    const createdUser = await this.repo.create(user);
    return createdUser;
  }

  async update(id: string, data: UserUpdateDTO): Promise<UserOutputDTO> {
    return this.repo.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    return this.repo.assignRole(userId, roleId);
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    return this.repo.removeRole(userId, roleId);
  }
}
