import { errors, TakaroDTO, NOT_DOMAIN_SCOPED_TakaroModelDTO, traceableClass } from '@takaro/util';
import { createLambda, deleteLambda } from '@takaro/aws';
import { UserCreateInputDTO, UserOutputDTO, UserService } from './UserService.js';
import { randomBytes } from 'crypto';
import { PermissionInputDTO, RoleService, ServiceRoleCreateInputDTO, RoleOutputDTO } from './RoleService.js';
import type { RoleOutputDTO as RoleOutputDTOType } from './RoleService.js';
import { NOT_DOMAIN_SCOPED_TakaroService } from './Base.js';
import { IsEnum, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { DOMAIN_STATES, DomainModel, DomainRepo } from '../db/domain.js';
export { DOMAIN_STATES } from '../db/domain.js';
import { humanId } from 'human-id';
import { Type } from 'class-transformer';
import { GameServerService, GameServerUpdateDTO } from './GameServerService.js';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { ModuleService } from './ModuleService.js';
import { ory, PERMISSIONS } from '@takaro/auth';
import { config } from '../config.js';
import { EXECUTION_MODE } from '@takaro/config';

export class DomainCreateInputDTO extends TakaroDTO<DomainCreateInputDTO> {
  @Length(3, 200)
  name: string;

  @Length(3, 200)
  @IsOptional()
  id: string;
}

export class DomainUpdateInputDTO extends TakaroDTO<DomainUpdateInputDTO> {
  @Length(3, 200)
  @IsOptional()
  name: string;

  @IsEnum(Object.values(DOMAIN_STATES))
  @IsOptional()
  state: DOMAIN_STATES;
}

export class DomainOutputDTO extends NOT_DOMAIN_SCOPED_TakaroModelDTO<DomainOutputDTO> {
  @IsString()
  name: string;

  @IsEnum(Object.values(DOMAIN_STATES))
  state: DOMAIN_STATES;
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
  rootRole: RoleOutputDTOType;

  @IsString()
  password: string;
}

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

  async update(id: string, item: DomainUpdateInputDTO): Promise<DomainOutputDTO> {
    if (item.state) {
      // If domain state changes, trigger an update for any gameservers too
      const gameServerService = new GameServerService(id);
      const allGameServers = await gameServerService.find({});
      for (const gameServer of allGameServers.results) {
        await gameServerService.update(gameServer.id, await new GameServerUpdateDTO().construct());
      }
    }

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

    if (config.get('functions.executionMode') == EXECUTION_MODE.LAMBDA) {
      await deleteLambda({ domainId: existing.id });
    }

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
    const moduleService = new ModuleService(domain.id);

    const rootPermission = await roleService.permissionCodeToRecord(PERMISSIONS.ROOT);
    const readPlayersPermission = await roleService.permissionCodeToRecord(PERMISSIONS.READ_PLAYERS);
    const readSettingsPermission = await roleService.permissionCodeToRecord(PERMISSIONS.READ_SETTINGS);

    const rootPermissionDTO = await new PermissionInputDTO().construct({ permissionId: rootPermission.id });
    const readPlayersPermissionDTO = await new PermissionInputDTO().construct({
      permissionId: readPlayersPermission.id,
    });
    const readSettingsPermissionDTO = await new PermissionInputDTO().construct({
      permissionId: readSettingsPermission.id,
    });

    const rootRole = await roleService.createWithPermissions(
      await new ServiceRoleCreateInputDTO().construct({ name: 'root', system: true }),
      [rootPermissionDTO]
    );

    const DEFAULT_ROLES: Promise<ServiceRoleCreateInputDTO>[] = [
      new ServiceRoleCreateInputDTO().construct({
        name: 'Admin',
        permissions: [rootPermissionDTO],
      }),
      new ServiceRoleCreateInputDTO().construct({
        name: 'Moderator',
        permissions: [readPlayersPermissionDTO, readSettingsPermissionDTO],
      }),
      new ServiceRoleCreateInputDTO().construct({
        name: 'Player',
        permissions: [],
        system: true,
      }),
      new ServiceRoleCreateInputDTO().construct({
        name: 'User',
        permissions: [],
        system: true,
      }),
    ];

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

    await userService.assignRole(rootRole.id, rootUser.id);

    await moduleService.seedBuiltinModules();

    if (config.get('functions.executionMode') == EXECUTION_MODE.LAMBDA) {
      await createLambda({ domainId: domain.id });
    }

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
