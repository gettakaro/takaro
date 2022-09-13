import { errors } from '@takaro/logger';
import { UserOutputDTO, UserService } from './UserService';
import { randomBytes } from 'crypto';
import { RoleOutputDTO, RoleService } from './RoleService';
import { NOT_DOMAIN_SCOPED_TakaroService } from './Base';
import { IsString, Length, ValidateNested } from 'class-validator';
import { DomainModel, DomainRepo } from '../db/domain';
import humanId from 'human-id';
import { CAPABILITIES } from '../db/role';
import { UserModel } from '../db/user';
import { Type } from 'class-transformer';
import { GameServerService } from './GameServerService';

export class DomainCreateInputDTO {
  @Length(3, 200)
  name!: string;
}

export class DomainOutputDTO {
  @IsString()
  id!: string;

  @IsString()
  name!: string;
}

export class DomainCreateOutputDTO {
  @Type(() => DomainOutputDTO)
  @ValidateNested()
  domain!: DomainOutputDTO;

  @Type(() => UserOutputDTO)
  @ValidateNested()
  rootUser!: UserOutputDTO;

  @Type(() => RoleOutputDTO)
  @ValidateNested()
  rootRole!: RoleOutputDTO;

  @IsString()
  password!: string;
}

export class DomainService extends NOT_DOMAIN_SCOPED_TakaroService<DomainModel> {
  get repo() {
    return new DomainRepo();
  }

  async initDomain(
    input: DomainCreateInputDTO
  ): Promise<DomainCreateOutputDTO> {
    const id = humanId({
      separator: '-',
      capitalize: false,
    });

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
    const gameServerService = new GameServerService(id);
    await gameServerService.manager.remove(id);
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
