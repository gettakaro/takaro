import { TakaroDTO, TakaroModelDTO } from '@takaro/util';
import { Type } from 'class-transformer';
import { IsString, IsJSON, IsOptional, ValidateNested, IsUUID, IsObject, Length } from 'class-validator';
import { CommandCreateDTO, CommandOutputDTO } from '../CommandService.js';
import { CronJobCreateDTO, CronJobOutputDTO } from '../CronJobService.js';
import { FunctionCreateDTO, FunctionOutputDTO } from '../FunctionService.js';
import { HookCreateDTO, HookOutputDTO } from '../HookService.js';
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

export class ModuleOutputDTO extends TakaroModelDTO<ModuleOutputDTO> {
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  builtin: string;
  @ValidateNested()
  @Type(() => ModuleVersionOutputDTO)
  latestVersion: ModuleVersionOutputDTO;
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

export class ModuleCreateAPIDTO extends TakaroDTO<ModuleCreateAPIDTO> {
  @IsString()
  @Length(3, 50)
  name!: string;
  @IsString()
  @IsOptional()
  @Length(1, 5000)
  description?: string;
  @IsJSON()
  @IsOptional()
  configSchema: string;
  @IsJSON()
  @IsOptional()
  uiSchema: string;
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PermissionCreateDTO)
  permissions: PermissionCreateDTO[];
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FunctionCreateDTO)
  functions: FunctionCreateDTO[];
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CommandCreateDTO)
  commands: CommandCreateDTO[];
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => HookCreateDTO)
  hooks: HookCreateDTO[];
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CronJobCreateDTO)
  cronJobs: CronJobCreateDTO[];
}

export class ModuleCreateInternalDTO extends TakaroDTO<ModuleCreateInternalDTO> {
  @IsString()
  @IsOptional()
  builtin: string;

  @IsString()
  @Length(3, 50)
  name!: string;
  @IsString()
  @IsOptional()
  @Length(1, 5000)
  description?: string;
  @IsJSON()
  @IsOptional()
  configSchema: string;
  @IsJSON()
  @IsOptional()
  uiSchema: string;
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PermissionCreateDTO)
  permissions: PermissionCreateDTO[];
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FunctionCreateDTO)
  functions: FunctionCreateDTO[];
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CommandCreateDTO)
  commands: CommandCreateDTO[];
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => HookCreateDTO)
  hooks: HookCreateDTO[];
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CronJobCreateDTO)
  cronJobs: CronJobCreateDTO[];
}

export class ModuleUpdateDTO extends TakaroDTO<ModuleUpdateDTO> {
  @Length(3, 50)
  @IsOptional()
  @IsString()
  name?: string;
}

export class ModuleVersionCreateAPIDTO extends TakaroDTO<ModuleVersionCreateAPIDTO> {
  @IsString()
  @Length(1, 100)
  tag: string;
}

export class ModuleVersionUpdateDTO extends TakaroDTO<ModuleVersionUpdateDTO> {
  @IsString()
  @IsOptional()
  @Length(1, 5000)
  description?: string;
  @IsJSON()
  @IsOptional()
  configSchema: string;
  @IsJSON()
  @IsOptional()
  uiSchema: string;
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PermissionCreateDTO)
  permissions: PermissionCreateDTO[];
}

export class ModuleExportInputDTO extends TakaroDTO<ModuleExportInputDTO> {
  @IsUUID()
  versionId: string;
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
