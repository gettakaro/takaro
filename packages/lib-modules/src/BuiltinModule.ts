import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import * as url from 'url';
import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { EventTypes, HookEvents } from './dto/index.js';
import { TakaroDTO } from '@takaro/util';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export class ICommandArgument extends TakaroDTO<ICommandArgument> {
  @IsString()
  name: string;
  @IsString()
  type: string;
  @IsString()
  @IsOptional()
  helpText?: string;
  @IsString()
  @IsOptional()
  defaultValue?: string | null;
  @IsNumber()
  @IsOptional()
  position?: number;
}

export class ICommand extends TakaroDTO<ICommand> {
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsString()
  function: string;
  @IsString()
  trigger: string;
  @IsString()
  @IsOptional()
  helpText?: string;
  @ValidateNested({ each: true })
  @Type(() => ICommandArgument)
  @IsOptional()
  arguments: ICommandArgument[];
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredPermissions?: string[];
}

export class IHook extends TakaroDTO<IHook> {
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsString()
  function: string;
  @IsEnum(Object.values(HookEvents))
  eventType: EventTypes;
  @IsString()
  @IsOptional()
  regex?: string;
}

export class ICronJob extends TakaroDTO<ICronJob> {
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsString()
  function: string;
  @IsString()
  temporalValue: string;
}

export class IFunction extends TakaroDTO<IFunction> {
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsString()
  function: string;
}

export class IPermission extends TakaroDTO<IPermission> {
  @IsString()
  permission: string;
  @IsString()
  description: string;
  @IsString()
  friendlyName: string;
  @IsOptional()
  @IsBoolean()
  canHaveCount?: boolean;
}

export class ModuleTransferVersionDTO<T> extends TakaroDTO<T> {
  @IsString()
  public tag: string;
  @IsString()
  public description: string;
  @IsString()
  public configSchema: string;
  @IsString()
  public uiSchema: string;
  @ValidateNested({ each: true })
  @Type(() => ICommand)
  @IsOptional()
  public commands?: Array<ICommand>;
  @ValidateNested({ each: true })
  @Type(() => IHook)
  @IsOptional()
  public hooks?: Array<IHook>;
  @ValidateNested({ each: true })
  @Type(() => ICronJob)
  @IsOptional()
  public cronJobs?: Array<ICronJob>;
  @ValidateNested({ each: true })
  @Type(() => IFunction)
  @IsOptional()
  public functions?: Array<IFunction>;
  @IsArray()
  @Type(() => IPermission)
  @ValidateNested({ each: true })
  @IsOptional()
  public permissions?: IPermission[];
}

export class ModuleTransferDTO<T> extends TakaroDTO<T> {
  @IsString()
  public name: string;
  @IsString()
  @IsOptional()
  takaroVersion = process.env.TAKARO_VERSION;

  @ValidateNested({ each: true })
  @Type(() => ModuleTransferVersionDTO)
  versions: ModuleTransferVersionDTO<T>[];

  protected loadFn(type: 'commands' | 'hooks' | 'cronJobs' | 'functions', name: string) {
    const folderPath = path.join(__dirname, 'modules', this.name, type);
    const files = readdirSync(folderPath);
    const file = files.find((file) => file.replace('.js', '') === name);
    if (!file) {
      throw new Error(`Could not find ${name} in ${this.name}'s ${type}. Did you provide a function implementation?`);
    }

    return readFileSync(path.join(folderPath, file), 'utf-8');
  }
}
