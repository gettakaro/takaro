import { TakaroService } from './Base.js';

import { CommandModel, CommandRepo } from '../db/command.js';
import {
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
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { SettingsService, SETTINGS_KEYS } from './SettingsService.js';
import { AuthService } from './AuthService.js';

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
}

export class CommandCreateDTO extends TakaroDTO<CommandCreateDTO> {
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
        `Found ${triggeredCommands.length} hooks that match the event`
      );

      const authService = new AuthService(this.domainId);
      const token = await authService.getAgentToken();
      const queues = QueuesService.getInstance();

      const promises = triggeredCommands.map(async (command) => {
        return queues.queues.commands.queue.add(command.id, {
          domainId: this.domainId,
          function: command.function.code,
          itemId: command.id,
          data: chatMessage,
          gameServerId,
          token,
        });
      });

      await Promise.all(promises);
    }
  }
}
