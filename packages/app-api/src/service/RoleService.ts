import { ITakaroQuery } from '@takaro/db';
import { TakaroDTO, TakaroModelDTO, ctx, errors, traceableClass } from '@takaro/util';
import { PERMISSIONS } from '@takaro/auth';
import { Type } from 'class-transformer';
import {
  Length,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  IsString,
  ValidateNested,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  IsBoolean,
  IsNumber,
  IsISO8601,
} from 'class-validator';
import { PaginatedOutput } from '../db/base.js';
import { RoleModel, RoleRepo } from '../db/role.js';
import { TakaroService } from './Base.js';
import { ModuleService } from './Module/index.js';
import { EventService, EventCreateDTO, EVENT_TYPES } from './EventService.js';
import { TakaroEventRoleCreated, TakaroEventRoleDeleted, TakaroEventRoleUpdated } from '@takaro/modules';
import { PlayerOutputWithRolesDTO } from './Player/dto.js';
import { UserOutputWithRolesDTO } from './User/index.js';

@ValidatorConstraint()
export class IsPermissionArray implements ValidatorConstraintInterface {
  public validate(permissions: PERMISSIONS[]) {
    return (
      Array.isArray(permissions) && permissions.every((permission) => Object.values(PERMISSIONS).includes(permission))
    );
  }
}

export class PermissionInputDTO extends TakaroDTO<PermissionInputDTO> {
  @IsString()
  permissionId: string;

  @IsNumber()
  @IsOptional()
  count: number | null;
}

export class RoleCreateInputDTO extends TakaroDTO<RoleCreateInputDTO> {
  @Length(3, 20)
  name: string;

  @ValidateNested({ each: true })
  @Type(() => PermissionInputDTO)
  permissions: PermissionInputDTO[];
}

export class ServiceRoleCreateInputDTO extends TakaroDTO<ServiceRoleCreateInputDTO> {
  @Length(3, 20)
  name: string;

  @ValidateNested({ each: true })
  @Type(() => PermissionInputDTO)
  permissions: PermissionInputDTO[];

  @IsBoolean()
  @IsOptional()
  system?: boolean;
}

export class RoleUpdateInputDTO extends TakaroDTO<RoleUpdateInputDTO> {
  @Length(3, 20)
  @IsOptional()
  name: string;

  @ValidateNested({ each: true })
  @Type(() => PermissionInputDTO)
  @IsOptional()
  permissions: PermissionInputDTO[];

  @IsString()
  @IsOptional()
  @Length(17, 20)
  linkedDiscordRoleId?: string;
}

export class SearchRoleInputDTO {
  @Length(3, 20)
  name: string;
}

class PermissionModuleDTO extends TakaroDTO<PermissionModuleDTO> {
  @IsUUID()
  id: string;
  @IsString()
  name: string;
}

class PermissionVersionDTO extends TakaroDTO<PermissionVersionDTO> {
  @IsUUID()
  id: string;
  @IsString()
  tag: string;
}

export class PermissionOutputDTO extends TakaroModelDTO<PermissionOutputDTO> {
  @IsOptional()
  @ValidateNested()
  @Type(() => PermissionModuleDTO)
  module?: PermissionModuleDTO;

  @IsOptional()
  @ValidateNested()
  @Type(() => PermissionVersionDTO)
  version?: PermissionVersionDTO;

  @IsOptional()
  @IsUUID('4')
  moduleVersionId: string;

  @IsString()
  @IsNotEmpty()
  permission!: string;

  @IsString()
  @IsNotEmpty()
  friendlyName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  @IsOptional()
  canHaveCount?: boolean;
}

export class PermissionOnRoleDTO extends TakaroModelDTO<PermissionOnRoleDTO> {
  @IsUUID()
  permissionId: string;

  @Type(() => PermissionOutputDTO)
  @ValidateNested()
  permission: PermissionOutputDTO;

  @IsNumber()
  count: number;
}

export class PermissionCreateDTO extends TakaroDTO<PermissionOutputDTO> {
  @IsString()
  permission!: string;

  @IsString()
  @IsNotEmpty()
  friendlyName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  @IsOptional()
  canHaveCount: boolean;
}

export class RoleOutputDTO extends TakaroModelDTO<RoleOutputDTO> {
  @IsString()
  name: string;

  @Type(() => PermissionOnRoleDTO)
  @ValidateNested({ each: true })
  permissions: PermissionOnRoleDTO[];

  @IsBoolean()
  system: boolean;

  @IsString()
  @IsOptional()
  linkedDiscordRoleId?: string;
}

export class PlayerRoleAssignmentOutputDTO extends TakaroModelDTO<PlayerRoleAssignmentOutputDTO> {
  @IsUUID()
  playerId: string;

  @IsUUID()
  roleId: string;

  @IsUUID()
  @IsOptional()
  gameServerId: string;

  @Type(() => RoleOutputDTO)
  @ValidateNested()
  role: RoleOutputDTO;

  @IsOptional()
  @IsISO8601()
  expiresAt: string;
}

export class UserAssignmentOutputDTO extends TakaroModelDTO<UserAssignmentOutputDTO> {
  @IsUUID()
  userId: string;

  @IsUUID()
  roleId: string;

  @IsUUID()
  @IsOptional()
  gameServerId: string;

  @Type(() => RoleOutputDTO)
  @ValidateNested()
  role: RoleOutputDTO;

  @IsOptional()
  @IsISO8601()
  expiresAt: string;
}

class RoleMembersPlayersOutputDTO extends TakaroDTO<RoleMembersPlayersOutputDTO> {
  @IsNumber()
  total: number;
  @ValidateNested({ each: true })
  @Type(() => PlayerOutputWithRolesDTO)
  results: PlayerOutputWithRolesDTO[];
}

class RoleMembersUsersOutputDTO extends TakaroDTO<RoleMembersUsersOutputDTO> {
  @IsNumber()
  total: number;
  @ValidateNested({ each: true })
  @Type(() => UserOutputWithRolesDTO)
  results: UserOutputWithRolesDTO[];
}

export class RoleMembersOutputDTO extends TakaroDTO<RoleMembersOutputDTO> {
  @ValidateNested()
  @Type(() => RoleMembersPlayersOutputDTO)
  players: RoleMembersPlayersOutputDTO;
  @ValidateNested()
  @Type(() => RoleMembersUsersOutputDTO)
  users: RoleMembersUsersOutputDTO;
}

@traceableClass('service:role')
export class RoleService extends TakaroService<RoleModel, RoleOutputDTO, RoleCreateInputDTO, RoleUpdateInputDTO> {
  get repo() {
    return new RoleRepo(this.domainId);
  }

  async find(filters: ITakaroQuery<RoleOutputDTO>): Promise<PaginatedOutput<RoleOutputDTO>> {
    return this.repo.find(filters);
  }

  async findOne(id: string): Promise<RoleOutputDTO | undefined> {
    return this.repo.findOne(id);
  }

  async create(item: ServiceRoleCreateInputDTO): Promise<RoleOutputDTO> {
    return await this.createWithPermissions(item, item.permissions);
  }

  async update(id: string, item: RoleUpdateInputDTO): Promise<RoleOutputDTO> {
    const toUpdate = await this.repo.findOne(id);

    if (toUpdate.name === 'root') {
      throw new errors.BadRequestError('Cannot update root role');
    }

    if (!toUpdate.system) {
      await this.repo.update(id, item);
    }

    await this.setPermissions(id, item.permissions);
    const res = await this.repo.findOne(id);

    const eventsService = new EventService(this.domainId);
    const userId = ctx.data.user;

    await eventsService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.ROLE_UPDATED,
        userId,
        meta: new TakaroEventRoleUpdated({ role: { id: res.id, name: res.name } }),
      }),
    );

    return res;
  }

  async delete(id: string) {
    const toDelete = await this.repo.findOne(id);

    if (toDelete.system) {
      throw new errors.BadRequestError('Cannot delete system roles');
    }

    await this.repo.delete(id);

    const eventsService = new EventService(this.domainId);
    const userId = ctx.data.user;

    await eventsService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.ROLE_DELETED,
        userId,
        meta: new TakaroEventRoleDeleted({ role: { id: toDelete.id, name: toDelete.name } }),
      }),
    );

    return id;
  }

  async createWithPermissions(role: RoleCreateInputDTO, permissions: PermissionInputDTO[]): Promise<RoleOutputDTO> {
    const createdRole = await this.repo.create(role);
    await this.setPermissions(createdRole.id, permissions);

    const res = await this.repo.findOne(createdRole.id);

    const eventsService = new EventService(this.domainId);
    const userId = ctx.data.user;

    await eventsService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.ROLE_CREATED,
        userId,
        meta: new TakaroEventRoleCreated({ role: { id: res.id, name: res.name } }),
      }),
    );

    return res;
  }

  async setPermissions(roleId: string, permissions: PermissionInputDTO[]) {
    const role = await this.repo.findOne(roleId);

    // Check if the role exists
    if (!role) {
      throw new Error(`Role with ID ${roleId} not found`);
    }

    const currentPermissions = role.permissions.map((p) => p.permissionId);
    const permissionIdsToSet = permissions.map((p) => p.permissionId);

    // Permissions to remove are those not in the new permissions list
    const toRemove = role.permissions.filter((permission) => !permissionIdsToSet.includes(permission.permissionId));

    // Permissions to add are those not in the current permissions of the role
    const toAdd = permissions.filter((permission) => !currentPermissions.includes(permission.permissionId));

    const toUpdate = permissions.filter((permission) => {
      const currentPermission = role.permissions.find((p) => p.permissionId === permission.permissionId);
      return currentPermission && currentPermission.count !== permission.count;
    });

    // For all to-update, first remove the perm and then re-add it
    await Promise.all(
      toUpdate.map((permission) =>
        this.repo
          .removePermissionFromRole(roleId, permission.permissionId)
          .then(() => this.repo.addPermissionToRole(roleId, permission)),
      ),
    );

    // Create promises for removing and adding permissions
    const removePromises = toRemove.map((permission) =>
      this.repo.removePermissionFromRole(roleId, permission.permissionId),
    );
    const addPromises = toAdd.map((permission) => this.repo.addPermissionToRole(roleId, permission));

    // Execute all the promises
    await Promise.all([...removePromises, ...addPromises]);

    // Return the updated role
    return this.repo.findOne(roleId);
  }

  async getPermissions() {
    const moduleService = new ModuleService(this.domainId);
    const installedModules = await moduleService.getInstalledModules({});
    const modulePermissions = installedModules
      // Ensure each module only appears once
      // We fetch the installations above, so module X can be installed on server A and B
      .filter((mod, index, self) => self.findIndex((m) => m.versionId === mod.versionId) === index)
      // Then transform the permissions to a flat array
      .flatMap((installation) =>
        installation.version.permissions.map((permission) => ({
          ...permission,
          module: { id: installation.moduleId, name: installation.module.name },
          version: { id: installation.versionId, tag: installation.version.tag },
        })),
      ) as PermissionOutputDTO[];

    const systemPermissions = await this.repo.getSystemPermissions();

    const allPermissions = systemPermissions.concat(modulePermissions);
    return allPermissions;
  }

  async permissionCodeToRecord(permissionCode: string): Promise<PermissionOutputDTO> {
    const record = await this.repo.permissionCodeToRecord(permissionCode);
    return new PermissionOutputDTO(record);
  }

  async getDiscordLinkedRoles(): Promise<RoleOutputDTO[]> {
    return this.repo.findDiscordLinkedRoles();
  }
}
