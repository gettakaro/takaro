import { ITakaroQuery } from '@takaro/db';
import { TakaroDTO, TakaroModelDTO } from '@takaro/util';
import { PERMISSIONS } from '@takaro/auth';
import { Type } from 'class-transformer';
import { Length, IsArray, ValidatorConstraint, ValidatorConstraintInterface, IsString, IsEnum } from 'class-validator';
import { PaginatedOutput } from '../db/base.js';
import { RoleModel, RoleRepo } from '../db/role.js';
import { TakaroService } from './Base.js';

@ValidatorConstraint()
export class IsPermissionArray implements ValidatorConstraintInterface {
  public async validate(permissions: PERMISSIONS[]) {
    return (
      Array.isArray(permissions) && permissions.every((permission) => Object.values(PERMISSIONS).includes(permission))
    );
  }
}

export class RoleCreateInputDTO extends TakaroDTO<RoleCreateInputDTO> {
  @Length(3, 20)
  name: string;

  @IsEnum(PERMISSIONS, { each: true })
  permissions: PERMISSIONS[];
}

export class RoleUpdateInputDTO extends TakaroDTO<RoleUpdateInputDTO> {
  @Length(3, 20)
  name: string;

  @IsEnum(PERMISSIONS, { each: true })
  permissions: PERMISSIONS[];
}

export class SearchRoleInputDTO {
  @Length(3, 20)
  name: string;
}

export class PermissionOutputDTO extends TakaroModelDTO<PermissionOutputDTO> {
  @IsEnum(PERMISSIONS)
  permission: PERMISSIONS;
}

export class RoleOutputDTO extends TakaroModelDTO<RoleOutputDTO> {
  @IsString()
  name: string;

  @IsArray()
  @Type(() => PermissionOutputDTO)
  permissions: PermissionOutputDTO[];
}

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

  async create(item: RoleCreateInputDTO): Promise<RoleOutputDTO> {
    return this.createWithPermissions(item, item.permissions);
  }

  async update(id: string, item: RoleUpdateInputDTO): Promise<RoleOutputDTO> {
    return this.repo.update(id, item);
  }

  async delete(id: string) {
    await this.repo.delete(id);
    return id;
  }

  async createWithPermissions(role: RoleCreateInputDTO, permissions: PERMISSIONS[]): Promise<RoleOutputDTO> {
    const createdRole = await this.repo.create(role);
    await Promise.all(
      permissions.map((permission) => {
        return this.repo.addPermissionToRole(createdRole.id, permission);
      })
    );

    return this.repo.findOne(createdRole.id);
  }

  async setPermissions(roleId: string, permissions: PERMISSIONS[]) {
    const role = await this.repo.findOne(roleId);

    const toRemove = role.permissions.filter((permission) => !permissions.includes(permission.permission));
    const toAdd = permissions.filter(
      (permission) => !role.permissions.map((cap) => cap.permission).includes(permission)
    );

    const removePromises = toRemove.map((permission) => {
      return this.repo.removePermissionFromRole(roleId, permission.permission);
    });
    const addPromises = toAdd.map((permission) => {
      return this.repo.addPermissionToRole(roleId, permission);
    });

    await Promise.all([...removePromises, ...addPromises]);

    return this.repo.findOne(roleId);
  }
}
