import { ITakaroQuery } from '@takaro/db';
import { TakaroDTO } from '@takaro/http';
import { Type } from 'class-transformer';
import {
  Length,
  IsArray,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  IsString,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { PaginatedOutput } from '../db/base';
import { RoleModel, RoleRepo } from '../db/role';
import { TakaroService } from './Base';

export enum CAPABILITIES {
  'ROOT' = 'ROOT',
  'MANAGE_USERS' = 'MANAGE_USERS',
  'READ_USERS' = 'READ_USERS',
  'MANAGE_ROLES' = 'MANAGE_ROLES',
  'READ_ROLES' = 'READ_ROLES',
  'MANAGE_GAMESERVERS' = 'MANAGE_GAMESERVERS',
  'READ_GAMESERVERS' = 'READ_GAMESERVERS',
  'READ_FUNCTIONS' = 'READ_FUNCTIONS',
  'MANAGE_FUNCTIONS' = 'MANAGE_FUNCTIONS',
  'READ_CRONJOBS' = 'READ_CRONJOBS',
  'MANAGE_CRONJOBS' = 'MANAGE_CRONJOBS',
  'READ_HOOKS' = 'READ_HOOKS',
  'MANAGE_HOOKS' = 'MANAGE_HOOKS',
  'READ_MODULES' = 'READ_MODULES',
  'MANAGE_MODULES' = 'MANAGE_MODULES',
  'READ_PLAYERS' = 'READ_PLAYERS',
  'MANAGE_PLAYERS' = 'MANAGE_PLAYERS',
  'MANAGE_SETTINGS' = 'MANAGE_SETTINGS',
  'READ_SETTINGS' = 'READ_SETTINGS',
}

@ValidatorConstraint()
export class IsCapabilityArray implements ValidatorConstraintInterface {
  public async validate(capabilities: CAPABILITIES[]) {
    return (
      Array.isArray(capabilities) &&
      capabilities.every((capability) =>
        Object.values(CAPABILITIES).includes(capability)
      )
    );
  }
}

export class RoleCreateInputDTO extends TakaroDTO<RoleCreateInputDTO> {
  @Length(3, 20)
  name: string;

  @IsEnum(CAPABILITIES, { each: true })
  capabilities: CAPABILITIES[];
}

export class RoleUpdateInputDTO extends TakaroDTO<RoleUpdateInputDTO> {
  @Length(3, 20)
  name: string;

  @IsEnum(CAPABILITIES, { each: true })
  capabilities: CAPABILITIES[];
}

export class SearchRoleInputDTO {
  @Length(3, 20)
  name: string;
}

export class CapabilityOutputDTO {
  @IsUUID()
  id: string;

  @IsEnum(CAPABILITIES)
  capability: CAPABILITIES;
}

export class RoleOutputDTO extends TakaroDTO<RoleOutputDTO> {
  @IsUUID()
  id: string;
  @IsString()
  name: string;

  @IsArray()
  @Type(() => CapabilityOutputDTO)
  capabilities: CapabilityOutputDTO[];
}

export class RoleService extends TakaroService<
  RoleModel,
  RoleOutputDTO,
  RoleCreateInputDTO,
  RoleUpdateInputDTO
> {
  get repo() {
    return new RoleRepo(this.domainId);
  }

  async find(
    filters: ITakaroQuery<RoleOutputDTO>
  ): Promise<PaginatedOutput<RoleOutputDTO>> {
    return this.repo.find(filters);
  }

  async findOne(id: string): Promise<RoleOutputDTO | undefined> {
    return this.repo.findOne(id);
  }

  async create(item: RoleCreateInputDTO): Promise<RoleOutputDTO> {
    return this.createWithCapabilities(item, item.capabilities);
  }

  async update(id: string, item: RoleUpdateInputDTO): Promise<RoleOutputDTO> {
    return this.repo.update(id, item);
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }

  async createWithCapabilities(
    role: RoleCreateInputDTO,
    capabilities: CAPABILITIES[]
  ): Promise<RoleOutputDTO> {
    const createdRole = await this.repo.create(role);
    await Promise.all(
      capabilities.map((capability) => {
        return this.repo.addCapabilityToRole(createdRole.id, capability);
      })
    );

    return this.repo.findOne(createdRole.id);
  }

  async setCapabilities(roleId: string, capabilities: CAPABILITIES[]) {
    const role = await this.repo.findOne(roleId);

    const toRemove = role.capabilities.filter(
      (capability) => !capabilities.includes(capability.capability)
    );
    const toAdd = capabilities.filter(
      (capability) =>
        !role.capabilities.map((cap) => cap.capability).includes(capability)
    );

    const removePromises = toRemove.map((capability) => {
      return this.repo.removeCapabilityFromRole(roleId, capability.capability);
    });
    const addPromises = toAdd.map((capability) => {
      return this.repo.addCapabilityToRole(roleId, capability);
    });

    await Promise.all([...removePromises, ...addPromises]);

    return this.repo.findOne(roleId);
  }
}
