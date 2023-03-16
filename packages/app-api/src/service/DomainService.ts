import {
  errors,
  TakaroDTO,
  NOT_DOMAIN_SCOPED_TakaroModelDTO,
} from '@takaro/util';
import {
  UserCreateInputDTO,
  UserOutputDTO,
  UserService,
} from './UserService.js';
import { randomBytes } from 'crypto';
import {
  CAPABILITIES,
  RoleCreateInputDTO,
  RoleOutputDTO,
  RoleService,
} from './RoleService.js';
import { NOT_DOMAIN_SCOPED_TakaroService } from './Base.js';
import { IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { DomainModel, DomainRepo } from '../db/domain.js';
import { humanId } from 'human-id';
import { Type } from 'class-transformer';
import { GameServerService } from './GameServerService.js';
import { SettingsService } from './SettingsService.js';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { CronJobService } from './CronJobService.js';
import { ModuleService } from './ModuleService.js';
import { Ory } from '../lib/ory.js';

export class DomainCreateInputDTO extends TakaroDTO<DomainCreateInputDTO> {
  @Length(3, 200)
  name: string;

  @Length(3, 200)
  @IsOptional()
  id: string;
}

export class DomainUpdateInputDTO extends TakaroDTO<DomainUpdateInputDTO> {
  @Length(3, 200)
  name: string;
}

export class DomainOutputDTO extends NOT_DOMAIN_SCOPED_TakaroModelDTO<DomainOutputDTO> {
  @IsString()
  name: string;
}

export class DomainCreateOutputDTO extends TakaroDTO<DomainCreateOutputDTO> {
  @Type(() => DomainOutputDTO)
  @ValidateNested()
  createdDomain: DomainOutputDTO;

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

    await new Ory().deleteIdentitiesForDomain(id);

    return this.repo.delete(id);
  }

  async initDomain(
    input: DomainCreateInputDTO
  ): Promise<DomainCreateOutputDTO> {
    const id = humanId({
      separator: '-',
      capitalize: false,
    });

    const domain = await this.repo.create(
      await new DomainCreateInputDTO().construct({ id, name: input.name })
    );

    const userService = new UserService(domain.id);
    const roleService = new RoleService(domain.id);
    const settingsService = new SettingsService(domain.id);
    const moduleService = new ModuleService(domain.id);

    await settingsService.init();

    const rootRole = await roleService.createWithCapabilities(
      await new RoleCreateInputDTO().construct({ name: 'root' }),
      [CAPABILITIES.ROOT]
    );

    const password = randomBytes(20).toString('hex');
    const rootUser = await userService.create(
      await new UserCreateInputDTO().construct({
        name: 'root',
        password: password,
        email: `root@${domain.id}.com`,
      })
    );

    await userService.assignRole(rootUser.id, rootRole.id);

    await moduleService.seedBuiltinModules();

    return new DomainCreateOutputDTO().construct({
      createdDomain: domain,
      rootUser,
      rootRole,
      password,
    });
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
