import { Type } from 'class-transformer';
import {
  Length,
  IsArray,
  ArrayMinSize,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  IsString,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { CAPABILITIES, RoleModel, RoleRepo } from '../db/role';
import { TakaroService } from './Base';

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

export class RoleCreateInputDTO {
  @Length(3, 20)
  name!: string;

  @IsArray()
  @ArrayMinSize(1)
  @Validate(IsCapabilityArray, { message: 'Invalid capabilities' })
  capabilities!: CAPABILITIES[];
}

export class RoleUpdateInputDTO {
  @Length(3, 20)
  name!: string;

  @IsArray()
  @ArrayMinSize(1)
  @Validate(IsCapabilityArray, { message: 'Invalid capabilities' })
  capabilities!: CAPABILITIES[];
}

export class SearchRoleInputDTO {
  @Length(3, 20)
  name!: string;
}

export class CapabilityOutputDTO {
  @IsUUID()
  id!: string;

  @IsEnum(CAPABILITIES)
  @IsString()
  capability!: CAPABILITIES;
}

export class RoleOutputDTO {
  @IsUUID()
  id!: string;
  @IsString()
  name!: string;

  @IsArray()
  @Type(() => CapabilityOutputDTO)
  capabilities!: CapabilityOutputDTO[];
}

export class RoleService extends TakaroService<RoleModel> {
  get repo() {
    return new RoleRepo(this.domainId);
  }

  async createWithCapabilities(
    roleName: string,
    capabilities: CAPABILITIES[]
  ): Promise<RoleModel> {
    const createdRole = await this.repo.create({ name: roleName });
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
