import { TakaroService } from './Base.js';

import { CommandModel, CommandRepo } from '../db/command.js';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import {
  FunctionCreateDTO,
  FunctionOutputDTO,
  FunctionService,
  FunctionUpdateDTO,
} from './FunctionService.js';
import { EventChatMessage } from '@takaro/gameserver';
import { QueuesService } from '@takaro/queues';
import { Type } from 'class-transformer';
import { TakaroDTO, errors, TakaroModelDTO } from '@takaro/util';
import { ICommand, ICommandArgument } from '@takaro/modules';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { SettingsService, SETTINGS_KEYS } from './SettingsService.js';
import { parseCommand } from '../lib/commandParser.js';

export class CommandOutputDTO extends TakaroModelDTO<CommandOutputDTO> {
  @IsString()
  name: string;

  @IsString()
  trigger: string;

  @IsString()
  helpText: string;

  @Type(() => FunctionOutputDTO)
  @ValidateNested()
  function: FunctionOutputDTO;

  @IsUUID()
  functionId: string;

  @IsUUID()
  moduleId: string;

  @Type(() => CommandArgumentOutputDTO)
  @ValidateNested({ each: true })
  arguments: CommandArgumentOutputDTO[];
}

export class CommandArgumentOutputDTO extends TakaroModelDTO<CommandArgumentOutputDTO> {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  helpText: string;

  @IsString()
  @IsOptional()
  defaultValue?: string;

  @IsNumber()
  position: number;
}

export class CommandCreateDTO
  extends TakaroDTO<CommandCreateDTO>
  implements ICommand
{
  @IsString()
  @Length(3, 50)
  name: string;

  @IsString()
  trigger: string;

  @IsString()
  @IsOptional()
  helpText?: string;

  @IsUUID()
  moduleId: string;

  @IsOptional()
  @IsString()
  function: string;

  @Type(() => CommandArgumentCreateDTO)
  @ValidateNested({ each: true })
  @IsOptional()
  arguments?: ICommandArgument[];
}

export class CommandArgumentCreateDTO
  extends TakaroDTO<CommandArgumentCreateDTO>
  implements ICommandArgument
{
  @IsString()
  @Length(3, 50)
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

  @IsUUID()
  commandId: string;
}

export class CommandUpdateDTO extends TakaroDTO<CommandUpdateDTO> {
  @Length(3, 50)
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  trigger: string;

  @IsString()
  @IsOptional()
  helpText?: string;

  @IsOptional()
  @IsString()
  function?: string;

  @Type(() => CommandArgumentCreateDTO)
  @ValidateNested({ each: true })
  @IsOptional()
  arguments?: ICommandArgument[];
}

export class CommandArgumentUpdateDTO extends TakaroDTO<CommandArgumentUpdateDTO> {
  @IsString()
  @Length(3, 50)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  helpText?: string;

  @IsString()
  @IsOptional()
  defaultValue?: string;
}

export class CommandService extends TakaroService<
  CommandModel,
  CommandOutputDTO,
  CommandCreateDTO,
  CommandUpdateDTO
> {
  get repo() {
    return new CommandRepo(this.domainId);
  }

  async find(
    filters: ITakaroQuery<CommandOutputDTO>
  ): Promise<PaginatedOutput<CommandOutputDTO>> {
    return this.repo.find(filters);
  }

  async findOne(id: string): Promise<CommandOutputDTO | undefined> {
    return this.repo.findOne(id);
  }

  async create(item: CommandCreateDTO) {
    const functionsService = new FunctionService(this.domainId);
    let fnIdToAdd: string | null = null;

    if (item.function) {
      const newFn = await functionsService.create(
        await new FunctionCreateDTO().construct({
          code: item.function,
        })
      );
      fnIdToAdd = newFn.id;
    } else {
      const newFn = await functionsService.create(
        await new FunctionCreateDTO().construct({
          code: '',
        })
      );
      fnIdToAdd = newFn.id;
    }

    const created = await this.repo.create(
      await new CommandCreateDTO().construct({ ...item, function: fnIdToAdd })
    );

    if (item.arguments) {
      await Promise.all(
        item.arguments.map(async (a) => {
          return this.createArgument(
            created.id,
            await new CommandArgumentCreateDTO().construct(a)
          );
        })
      );
    }

    return created;
  }

  async update(id: string, item: CommandUpdateDTO) {
    const existing = await this.repo.findOne(id);

    if (!existing) {
      throw new errors.NotFoundError('Command not found');
    }

    if (item.function) {
      const functionsService = new FunctionService(this.domainId);
      const fn = await functionsService.findOne(existing.function.id);
      if (!fn) {
        throw new errors.NotFoundError('Function not found');
      }

      await functionsService.update(
        fn.id,
        await new FunctionUpdateDTO().construct({
          code: item.function,
        })
      );
    }

    if (item.arguments) {
      // Delete existing args first
      const existingArgs = existing.arguments;
      await Promise.all(
        existingArgs.map(async (a) => {
          return this.deleteArgument(a.id);
        })
      );

      // Create new args
      await Promise.all(
        item.arguments.map(async (a) => {
          return this.createArgument(
            id,
            await new CommandArgumentCreateDTO().construct(a)
          );
        })
      );
    }

    const updated = await this.repo.update(id, item);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }

  async handleChatMessage(chatMessage: EventChatMessage, gameServerId: string) {
    const prefix = await new SettingsService(this.domainId, gameServerId).get(
      SETTINGS_KEYS.commandPrefix
    );
    if (!chatMessage.msg.startsWith(prefix)) {
      // Message doesn't start with configured prefix
      // Ignore it
      return;
    }

    const commandName = chatMessage.msg.slice(prefix.length).split(' ')[0];

    const triggeredCommands = await this.repo.getTriggeredCommands(
      commandName,
      gameServerId
    );

    if (triggeredCommands.length) {
      this.log.debug(
        `Found ${triggeredCommands.length} commands that match the event`
      );

      const parsedCommands = triggeredCommands.map((c) => ({
        db: c,
        parsed: parseCommand(chatMessage.msg, c),
      }));

      const queues = QueuesService.getInstance();

      const promises = parsedCommands.map(async ({ parsed, db }) => {
        return queues.queues.commands.queue.add(db.id, {
          domainId: this.domainId,
          function: db.function.code,
          itemId: db.id,
          data: parsed,
          gameServerId,
        });
      });

      await Promise.all(promises);
    }
  }

  async createArgument(commandId: string, arg: CommandArgumentCreateDTO) {
    const created = await this.repo.createArgument(commandId, arg);
    return created;
  }

  async updateArgument(argumentId: string, arg: CommandArgumentUpdateDTO) {
    const updated = await this.repo.updateArgument(argumentId, arg);
    return updated;
  }

  async deleteArgument(argumentId: string) {
    return this.repo.deleteArgument(argumentId);
  }
}
