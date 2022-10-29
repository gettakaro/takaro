import { errors } from '@takaro/util';
import { UserCreateInputDTO, UserOutputDTO, UserService } from './UserService';
import { randomBytes } from 'crypto';
import {
  CAPABILITIES,
  RoleCreateInputDTO,
  RoleOutputDTO,
  RoleService,
} from './RoleService';
import { NOT_DOMAIN_SCOPED_TakaroService } from './Base';
import { IsString, Length, ValidateNested } from 'class-validator';
import { DomainModel, DomainRepo } from '../db/domain';
import humanId from 'human-id';
import { Type } from 'class-transformer';
import { GameServerService } from './GameServerService';
import { SettingsService } from './SettingsService';
import { TakaroDTO } from '@takaro/http';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base';
import { CronJobService } from './CronJobService';

export class DomainCreateInputDTO extends TakaroDTO<DomainCreateInputDTO> {
  @Length(3, 200)
  name: string;

  @Length(3, 200)
  id: string;
}

export class DomainUpdateInputDTO extends TakaroDTO<DomainUpdateInputDTO> {
  @Length(3, 200)
  name: string;
}

export class DomainOutputDTO extends TakaroDTO<DomainOutputDTO> {
  @IsString()
  id: string;

  @IsString()
  name: string;
}

export class DomainCreateOutputDTO extends TakaroDTO<DomainCreateOutputDTO> {
  @Type(() => DomainOutputDTO)
  @ValidateNested()
  domain: DomainOutputDTO;

  @Type(() => UserOutputDTO)
  @ValidateNested()
  rootUser: UserOutputDTO;

  @Type(() => RoleOutputDTO)
  @ValidateNested()
  rootRole: RoleOutputDTO;

  @IsString()
  password: string;
}

export class DomainService extends NOT_DOMAIN_SCOPED_TakaroService<
  DomainModel,
  DomainOutputDTO,
  DomainCreateInputDTO,
  DomainUpdateInputDTO
> {
  get repo() {
    return new DomainRepo();
  }

  find(
    filters: ITakaroQuery<DomainOutputDTO>
  ): Promise<PaginatedOutput<DomainOutputDTO>> {
    return this.repo.find(filters);
  }

  findOne(id: string): Promise<DomainOutputDTO | undefined> {
    return this.repo.findOne(id);
  }

  create(): Promise<DomainOutputDTO> {
    throw new Error('Method not implemented, use initDomain instead');
  }

  update(id: string, item: DomainUpdateInputDTO): Promise<DomainOutputDTO> {
    return this.repo.update(id, item);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findOne(id);

    if (!existing) {
      throw new errors.NotFoundError();
    }

    const gameServerService = new GameServerService(id);
    const allGameServers = await gameServerService.find({});
    for (const gameServer of allGameServers.results) {
      await gameServerService.delete(gameServer.id);
    }

    const cronJobService = new CronJobService(id);
    const allCronJobs = await cronJobService.find({});
    for (const cronJob of allCronJobs.results) {
      await cronJobService.delete(cronJob.id);
    }

    return this.repo.delete(id);
  }

  async initDomain(
    input: Omit<DomainCreateInputDTO, 'id'>
  ): Promise<DomainCreateOutputDTO> {
    const id = humanId({
      separator: '-',
      capitalize: false,
    });

    const domain = await this.repo.create(
      new DomainCreateInputDTO({ id, name: input.name })
    );

    const userService = new UserService(domain.id);
    const roleService = new RoleService(domain.id);
    const settingsService = new SettingsService(domain.id);

    await settingsService.init();

    const rootRole = await roleService.createWithCapabilities(
      new RoleCreateInputDTO({ name: 'root' }),
      [CAPABILITIES.ROOT]
    );

    const password = randomBytes(20).toString('hex');
    const rootUser = await userService.create(
      new UserCreateInputDTO({
        name: 'root',
        password: password,
        email: `root@${domain.id}`,
      })
    );

    await userService.assignRole(rootUser.id, rootRole.id);

    return new DomainCreateOutputDTO({ domain, rootUser, rootRole, password });
  }

  async addLogin(user: UserOutputDTO, domainId: string) {
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
