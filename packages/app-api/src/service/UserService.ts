import { genSalt, hash } from 'bcrypt';
import { config } from '../config';
import { CreateUserDTO } from '../controllers/UserController';
import { TakaroService } from './Base';

import { UserModel, UserRepo } from '../db/user';
import { DomainService } from './DomainService';

export class UserService extends TakaroService<UserModel> {
  get repo() {
    return new UserRepo(this.domainId);
  }

  findOne(id: string) {
    return this.repo.findOne(id);
  }

  async init(user: CreateUserDTO): Promise<UserModel> {
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
