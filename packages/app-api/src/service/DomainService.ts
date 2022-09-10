import { migrateDomain } from '@takaro/db';
import { errors } from '@takaro/logger';
import { UserService } from './UserService';
import { randomBytes } from 'crypto';
import { RoleService } from './RoleService';
import { NOT_DOMAIN_SCOPED_TakaroService } from './Base';
import { Length } from 'class-validator';
import { DomainModel, DomainRepo } from '../db/domain';
import humanId from 'human-id';
import { CAPABILITIES, RoleModel } from '../db/role';
import { UserModel } from '../db/user';

export class CreateDomainDTO {
  @Length(3, 20)
  name!: string;
}

export class DomainService extends NOT_DOMAIN_SCOPED_TakaroService<DomainModel> {
  get repo() {
    return new DomainRepo();
  }

  async initDomain(input: CreateDomainDTO): Promise<{
    domain: DomainModel;
    rootUser: UserModel;
    rootRole: RoleModel;
    password: string;
  }> {
    const id = humanId({
      separator: '-',
      capitalize: false,
    });
    await migrateDomain(id);

    const domain = await this.repo.create({ ...input, id });

    const userService = new UserService(domain.id);
    const roleService = new RoleService(domain.id);

    const rootRole = await roleService.createWithCapabilities('root', [
      CAPABILITIES.ROOT,
    ]);

    const password = randomBytes(20).toString('hex');
    const rootUser = await userService.init({
      name: 'root',
      password: password,
      email: `root@${input.name}`,
    });

    await userService.assignRole(rootUser.id, rootRole.id);

    return { domain, rootUser, rootRole, password };
  }

  async removeDomain(id: string) {
    await this.repo.delete(id);
  }

  async addLogin(user: UserModel, domainId: string) {
    await this.repo.addLogin(user.id, user.email, domainId);
  }

  async resolveDomain(email: string): Promise<string> {
    const domain = await this.repo.resolveDomain(email);
    if (!domain) {
      this.log.warn(
        `Tried to lookup an email that is not in any domain: ${email}`
      );
      throw new errors.UnauthorizedError();
    }
    return domain;
  }
}
