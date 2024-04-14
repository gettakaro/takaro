import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import * as url from 'url';
import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { EventTypes, HookEvents } from './dto/index.js';
import { PermissionCreateDTO } from '@takaro/apiclient';
import { TakaroDTO } from '@takaro/util';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export class ICommandArgument {
  @IsString()
  name: string;
  @IsString()
  type: string;
  @IsString()
  @IsOptional()
  helpText?: string;
  @IsString()
  @IsOptional()
  defaultValue?: string;
  @IsNumber()
  @IsOptional()
  position?: number;
}

export class ICommand extends TakaroDTO<ICommand> {
  @IsString()
  name: string;
  @IsString()
  function: string;
  @IsString()
  trigger: string;
  @IsString()
  @IsOptional()
  helpText?: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ICommandArgument)
  @IsOptional()
  arguments?: ICommandArgument[];
}

export class IHook extends TakaroDTO<IHook> {
  @IsString()
  name: string;
  @IsString()
  function: string;
  @IsEnum(Object.values(HookEvents))
  eventType: EventTypes;
}

export class ICronJob extends TakaroDTO<ICronJob> {
  @IsString()
  name: string;
  @IsString()
  function: string;
  @IsString()
  temporalValue: string;
}

export class IFunction extends TakaroDTO<IFunction> {
  @IsString()
  name: string;
  @IsString()
  function: string;
}

export class BuiltinModule<T> extends TakaroDTO<T> {
  constructor(
    public name: string,
    public description: string,
    public configSchema: string,
    public uiSchema: string = JSON.stringify({})
  ) {
    super();
  }

  @ValidateNested({ each: true })
  @Type(() => ICommand)
  public commands: Array<ICommand> = [];
  @ValidateNested({ each: true })
  @Type(() => IHook)
  public hooks: Array<IHook> = [];
  @ValidateNested({ each: true })
  @Type(() => ICronJob)
  public cronJobs: Array<ICronJob> = [];
  @ValidateNested({ each: true })
  @Type(() => IFunction)
  public functions: Array<IFunction> = [];
  @IsArray()
  public permissions: PermissionCreateDTO[] = [];

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
