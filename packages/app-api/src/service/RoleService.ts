import { ITakaroQuery } from '@takaro/db';
import { TakaroDTO, TakaroModelDTO, errors, traceableClass } from '@takaro/util';
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
} from 'class-validator';
import { PaginatedOutput } from '../db/base.js';
import { RoleModel, RoleRepo } from '../db/role.js';
import { TakaroService } from './Base.js';
import { UserService } from './UserService.js';
import { PlayerService } from './PlayerService.js';
import { EventCreateDTO, EventService } from './EventService.js';
import { ModuleService } from './ModuleService.js';

@ValidatorConstraint()
export class IsPermissionArray implements ValidatorConstraintInterface {
  public async validate(permissions: PERMISSIONS[]) {
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
  name: string;

  @ValidateNested({ each: true })
  @Type(() => PermissionInputDTO)
  permissions: PermissionInputDTO[];
}

export class SearchRoleInputDTO {
  @Length(3, 20)
  name: string;
}

export class PermissionOutputDTO extends TakaroModelDTO<PermissionOutputDTO> {
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
  canHaveCount: boolean;
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
}

export class RoleAssignmentOutputDTO extends TakaroModelDTO<RoleAssignmentOutputDTO> {
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
    return this.createWithPermissions(item, item.permissions);
  }

  async update(id: string, item: RoleUpdateInputDTO): Promise<RoleOutputDTO> {
    const toUpdate = await this.repo.findOne(id);

    if (toUpdate.name === 'root') {
      throw new errors.BadRequestError('Cannot update root role');
    }

    if (!toUpdate?.system) {
      await this.repo.update(id, item);
    }

    await this.setPermissions(id, item.permissions);
    return this.repo.findOne(id);
  }

  async delete(id: string) {
    const toDelete = await this.repo.findOne(id);

    if (toDelete?.system) {
      throw new errors.BadRequestError('Cannot delete system roles');
    }

    await this.repo.delete(id);
    return id;
  }

  async createWithPermissions(role: RoleCreateInputDTO, permissions: PermissionInputDTO[]): Promise<RoleOutputDTO> {
    const createdRole = await this.repo.create(role);
    await this.setPermissions(createdRole.id, permissions);
    return this.repo.findOne(createdRole.id);
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
          .then(() => this.repo.addPermissionToRole(roleId, permission))
      )
    );

    // Create promises for removing and adding permissions
    const removePromises = toRemove.map((permission) =>
      this.repo.removePermissionFromRole(roleId, permission.permissionId)
    );
    const addPromises = toAdd.map((permission) => this.repo.addPermissionToRole(roleId, permission));

    // Execute all the promises
    await Promise.all([...removePromises, ...addPromises]);

    // Return the updated role
    return this.repo.findOne(roleId);
  }

  async assignRole(roleId: string, targetId: string, gameserverId?: string) {
    const userService = new UserService(this.domainId);
    const playerService = new PlayerService(this.domainId);
    const eventService = new EventService(this.domainId);

    const userRes = await userService.find({ filters: { id: [targetId] } });
    const playerRes = await playerService.find({ filters: { id: [targetId] } });

    if (userRes.total) {
      this.log.info('Assigning role to user');
      await this.repo.assignRoleToUser(targetId, roleId);
      await eventService.create(
        await new EventCreateDTO().construct({
          eventName: 'roleAssigned',
          userId: targetId,
          meta: {
            roleId: roleId,
          },
        })
      );
    }
    if (playerRes.total) {
      this.log.info('Assigning role to player');
      await this.repo.assignRoleToPlayer(targetId, roleId, gameserverId);
      await eventService.create(
        await new EventCreateDTO().construct({
          eventName: 'roleAssigned',
          gameserverId,
          playerId: targetId,
          meta: {
            roleId: roleId,
          },
        })
      );
    }
  }

  async removeRole(roleId: string, targetId: string, gameserverId?: string) {
    const userService = new UserService(this.domainId);
    const playerService = new PlayerService(this.domainId);
    const eventService = new EventService(this.domainId);

    const userRes = await userService.find({ filters: { id: [targetId] } });
    const playerRes = await playerService.find({ filters: { id: [targetId] } });

    if (userRes.total) {
      this.log.info('Removing role from user');
      await this.repo.removeRoleFromUser(targetId, roleId);
      await eventService.create(
        await new EventCreateDTO().construct({
          eventName: 'roleRemoved',
          userId: targetId,
          meta: {
            roleId: roleId,
          },
        })
      );
    }
    if (playerRes.total) {
      this.log.info('Removing role from player');
      await this.repo.removeRoleFromPlayer(targetId, roleId, gameserverId);
      await eventService.create(
        await new EventCreateDTO().construct({
          eventName: 'roleRemoved',
          playerId: targetId,
          gameserverId,
          meta: {
            roleId: roleId,
          },
        })
      );
    }
  }

  async getPermissions() {
    const moduleService = new ModuleService(this.domainId);
    const modules = await moduleService.find({ limit: 1000 });
    const modulePermissions = modules.results.map((mod) => mod.permissions).flat();
    const systemPermissions = await this.repo.getSystemPermissions();

    const allPermissions = systemPermissions.concat(modulePermissions);
    return allPermissions;
  }

  async permissionCodeToRecord(permissionCode: string): Promise<PermissionOutputDTO> {
    const record = await this.repo.permissionCodeToRecord(permissionCode);
    return await new PermissionOutputDTO().construct(record);
  }
}
