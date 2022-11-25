import { TakaroService } from './Base';

import { CommandModel, CommandRepo } from '../db/command';
import {
  IsBoolean,
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
} from './FunctionService';
import { EventChatMessage } from '@takaro/gameserver';
import { QueuesService } from '@takaro/queues';
import { Type } from 'class-transformer';
import { TakaroDTO } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base';
import { SettingsService, SETTINGS_KEYS } from './SettingsService';
import { AuthService } from './AuthService';

export class CommandOutputDTO extends TakaroDTO<CommandOutputDTO> {
  @IsUUID()
  id: string;
  @IsString()
  name: string;

  @IsString()
  trigger: string;

  @IsString()
  helpText: string;

  @IsBoolean()
  enabled: boolean;

  @IsString()
  functionId: string;

  @Type(() => FunctionOutputDTO)
  @ValidateNested()
  function: FunctionOutputDTO;

  @IsString()
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

  @IsOptional()
  @IsBoolean()
  enabled: boolean;

  @IsUUID()
  moduleId: string;

  @IsOptional()
  @IsUUID()
  function?: string;
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

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
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
      fnIdToAdd = item.function;
    } else {
      const newFn = await functionsService.create(
        new FunctionCreateDTO({
          code: '',
        })
      );
      fnIdToAdd = newFn.id;
    }

    const created = await this.repo.create(
      new CommandCreateDTO({ ...item, function: fnIdToAdd })
    );
    return created;
  }

  async update(id: string, item: CommandUpdateDTO) {
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

    const triggeredCommands = await this.find({
      filters: { trigger: commandName },
    });

    if (triggeredCommands.results.length) {
      const authService = new AuthService(this.domainId);
      const token = await authService.getAgentToken();
      const queues = QueuesService.getInstance();

      const promises = triggeredCommands.results.map(async (command) => {
        return queues.queues.commands.queue.add(command.id, {
          domainId: this.domainId,
          function: command.function.code,
          itemId: command.id,
          data: chatMessage,
          token,
        });
      });

      await Promise.all(promises);
    }
  }
}
