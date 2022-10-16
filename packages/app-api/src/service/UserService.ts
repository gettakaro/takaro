import { genSalt, hash } from 'bcrypt';
import { config } from '../config';
import { TakaroService } from './Base';

import { UserModel, UserRepo } from '../db/user';
import { DomainService } from './DomainService';
import { IsEmail, IsString, IsUUID, Length } from 'class-validator';

export class UserOutputDTO {
  @IsUUID()
  id!: string;
  @IsString()
  name!: string;
  @IsString()
  email!: string;
}

export class UserCreateInputDTO {
  @Length(3, 50)
  name!: string;

  @IsEmail()
  email!: string;

  // We're using Blowfish based hashing in the database, which has a max length of 72 characters
  @Length(8, 70)
  password!: string;
}

export class UserService extends TakaroService<UserModel> {
  get repo() {
    return new UserRepo(this.domainId);
  }

  findOne(id: string) {
    return this.repo.findOne(id);
  }

  async init(user: UserCreateInputDTO): Promise<UserModel> {
    const salt = await genSalt(config.get('auth.saltRounds'));
    const passwordHash = await hash(user.password, salt);

    const domainService = new DomainService();

    const createdUser = await this.repo.create({
      password: passwordHash,
      name: user.name,
      email: user.email,
    });

    await domainService.addLogin(createdUser, this.domainId);

    return createdUser;
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    return this.repo.assignRole(userId, roleId);
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    return this.repo.removeRole(userId, roleId);
  }
}
