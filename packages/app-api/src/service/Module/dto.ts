import { TakaroDTO, TakaroModelDTO } from '@takaro/util';
import { Type } from 'class-transformer';
import { IsString, IsJSON, IsOptional, ValidateNested, IsUUID, IsObject, Length, IsISO8601 } from 'class-validator';
import { CommandOutputDTO } from '../CommandService.js';
import { CronJobOutputDTO } from '../CronJobService.js';
import { FunctionOutputDTO } from '../FunctionService.js';
import { HookOutputDTO } from '../HookService.js';
import { PermissionCreateDTO, PermissionOutputDTO } from '../RoleService.js';

export class ModuleVersionOutputDTO extends TakaroModelDTO<ModuleVersionOutputDTO> {
  @IsString()
  tag: string;
  @IsString()
  description: string;
  @IsJSON()
  configSchema: string;
  @IsJSON()
  uiSchema: string;
  @IsJSON()
  systemConfigSchema: string;
  @IsJSON()
  @IsOptional()
  defaultSystemConfig: string;
  @IsUUID('4')
  moduleId: string;
  @Type(() => CronJobOutputDTO)
  @ValidateNested({ each: true })
  cronJobs: CronJobOutputDTO[];
  @Type(() => HookOutputDTO)
  @ValidateNested({ each: true })
  hooks: HookOutputDTO[];
  @Type(() => CommandOutputDTO)
  @ValidateNested({ each: true })
  commands: CommandOutputDTO[];
  @Type(() => FunctionOutputDTO)
  @ValidateNested({ each: true })
  functions: FunctionOutputDTO[];
  @ValidateNested({ each: true })
  @Type(() => PermissionOutputDTO)
  permissions: PermissionOutputDTO[];
}

export class SmallModuleVersionOutputDTO extends TakaroDTO<SmallModuleVersionOutputDTO> {
  @IsUUID('4')
  id: string;
  @IsString()
  tag: string;
  @IsISO8601()
  createdAt: string;
  @IsISO8601()
  updatedAt: string;
}

export class ModuleOutputDTO extends TakaroModelDTO<ModuleOutputDTO> {
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  builtin: string;
  @ValidateNested()
  @Type(() => ModuleVersionOutputDTO)
  latestVersion: ModuleVersionOutputDTO;
  @ValidateNested({ each: true })
  @Type(() => SmallModuleVersionOutputDTO)
  @IsOptional()
  versions?: SmallModuleVersionOutputDTO[];
}

export class ModuleInstallationOutputDTO extends TakaroModelDTO<ModuleInstallationOutputDTO> {
  @IsUUID()
  gameserverId: string;
  @IsUUID()
  versionId: string;
  @IsUUID()
  moduleId: string;
  @ValidateNested()
  @Type(() => ModuleVersionOutputDTO)
  version: ModuleVersionOutputDTO;
  @ValidateNested()
  @Type(() => ModuleOutputDTO)
  module: ModuleOutputDTO;
  @IsObject()
  userConfig: Record<string, any>;
  @IsObject()
  systemConfig: Record<string, any>;
}

export class ModuleCreateDTO extends TakaroDTO<ModuleCreateDTO> {
  @IsString()
  @Length(3, 50)
  name!: string;

  @IsString()
  @IsOptional()
  builtin: string;
}

export class ModuleCreateVersionInputDTO extends TakaroDTO<ModuleCreateVersionInputDTO> {
  @IsString()
  @IsOptional()
  @Length(1, 500000)
  description?: string;
  @IsJSON()
  @IsOptional()
  configSchema: string;
  @IsJSON()
  @IsOptional()
  uiSchema: string;
  @IsJSON()
  @IsOptional()
  defaultSystemConfig?: string;
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PermissionCreateDTO)
  permissions: PermissionCreateDTO[];
}

export class ModuleCreateAPIDTO extends TakaroDTO<ModuleCreateAPIDTO> {
  @IsString()
  @Length(3, 50)
  name!: string;
  @ValidateNested()
  @Type(() => ModuleCreateVersionInputDTO)
  @IsOptional()
  latestVersion?: ModuleCreateVersionInputDTO;
}

export class ModuleCreateInternalDTO extends TakaroDTO<ModuleCreateInternalDTO> {
  @IsString()
  @IsOptional()
  builtin: string;

  @IsString()
  @Length(3, 50)
  name!: string;
  @ValidateNested()
  @Type(() => ModuleCreateVersionInputDTO)
  latestVersion: ModuleCreateVersionInputDTO;
}

export class ModuleVersionUpdateDTO extends TakaroDTO<ModuleVersionUpdateDTO> {
  @IsString()
  @IsOptional()
  @Length(1, 500000)
  description?: string;
  @IsJSON()
  @IsOptional()
  configSchema: string;
  @IsJSON()
  @IsOptional()
  uiSchema: string;
  @IsJSON()
  @IsOptional()
  defaultSystemConfig?: string;
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PermissionCreateDTO)
  permissions: PermissionCreateDTO[];
}
export class ModuleUpdateDTO extends TakaroDTO<ModuleUpdateDTO> {
  @Length(3, 50)
  @IsOptional()
  @IsString()
  name?: string;

  @ValidateNested()
  @Type(() => ModuleVersionUpdateDTO)
  @IsOptional()
  latestVersion?: ModuleVersionUpdateDTO;
}

export class ModuleVersionCreateAPIDTO extends TakaroDTO<ModuleVersionCreateAPIDTO> {
  @IsString()
  @Length(1, 100)
  tag: string;
  @IsUUID('4')
  moduleId: string;
}

export class InstallModuleDTO extends TakaroDTO<InstallModuleDTO> {
  @IsUUID('4')
  versionId: string;
  @IsUUID('4')
  gameServerId: string;
  @IsJSON()
  @IsOptional()
  userConfig?: string;
  @IsJSON()
  @IsOptional()
  systemConfig?: string;
}

export class ModuleExportOptionsDTO extends TakaroDTO<ModuleExportOptionsDTO> {
  @IsUUID('4', { each: true })
  @IsOptional()
  versionIds?: string[];
}
