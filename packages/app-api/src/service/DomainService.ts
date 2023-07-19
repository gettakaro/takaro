import { errors, TakaroDTO, NOT_DOMAIN_SCOPED_TakaroModelDTO, traceableClass } from '@takaro/util';
import { UserCreateInputDTO, UserOutputDTO, UserService } from './UserService.js';
import { randomBytes } from 'crypto';
import { RoleCreateInputDTO, RoleOutputDTO, RoleService } from './RoleService.js';
import { NOT_DOMAIN_SCOPED_TakaroService } from './Base.js';
import { IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { DomainModel, DomainRepo } from '../db/domain.js';
import { humanId } from 'human-id';
import { Type } from 'class-transformer';
import { GameServerService } from './GameServerService.js';
import { SettingsService } from './SettingsService.js';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { ModuleService } from './ModuleService.js';
import { ory, PERMISSIONS } from '@takaro/auth';

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

const DEFAULT_ROLES: Promise<RoleCreateInputDTO>[] = [
  new RoleCreateInputDTO().construct({
    name: 'Admin',
    permissions: ['ROOT'],
  }),
  new RoleCreateInputDTO().construct({
    name: 'Moderator',
    permissions: ['TELEPORTS_USE', PERMISSIONS.READ_PLAYERS, PERMISSIONS.READ_SETTINGS],
  }),
  new RoleCreateInputDTO().construct({
    name: 'Player',
    permissions: ['TELEPORTS_USE'],
  }),
];

@traceableClass('service:domain')
export class DomainService extends NOT_DOMAIN_SCOPED_TakaroService<
  DomainModel,
  DomainOutputDTO,
  DomainCreateInputDTO,
  DomainUpdateInputDTO
> {
  get repo() {
    return new DomainRepo();
  }

  find(filters: ITakaroQuery<DomainOutputDTO>): Promise<PaginatedOutput<DomainOutputDTO>> {
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

  async delete(id: string) {
    const existing = await this.findOne(id);

    if (!existing) {
      throw new errors.NotFoundError();
    }

    const gameServerService = new GameServerService(id);
    const allGameServers = await gameServerService.find({});
    for (const gameServer of allGameServers.results) {
      await gameServerService.delete(gameServer.id);
    }

    await ory.deleteIdentitiesForDomain(id);

    await this.repo.delete(id);

    return id;
  }

  async initDomain(input: DomainCreateInputDTO): Promise<DomainCreateOutputDTO> {
    const id = humanId({
      separator: '-',
      capitalize: false,
    });

    const domain = await this.repo.create(await new DomainCreateInputDTO().construct({ id, name: input.name }));

    const userService = new UserService(domain.id);
    const roleService = new RoleService(domain.id);
    const settingsService = new SettingsService(domain.id);
    const moduleService = new ModuleService(domain.id);

    await settingsService.init();

    const rootRole = await roleService.createWithPermissions(
      await new RoleCreateInputDTO().construct({ name: 'root' }),
      [PERMISSIONS.ROOT]
    );

    const defaultRolesToCreate = await Promise.all(DEFAULT_ROLES);
    await Promise.all(defaultRolesToCreate.map((r) => roleService.create(r)));

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
      this.log.warn(`Tried to lookup an email that is not in any domain: ${email}`);
      throw new errors.UnauthorizedError();
    }
    return domain;
  }
}
