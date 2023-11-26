import { TakaroService } from './Base.js';

import { CommandModel, CommandRepo } from '../db/command.js';
import { IsNumber, IsOptional, IsString, IsUUID, Length, ValidateNested } from 'class-validator';
import { FunctionCreateDTO, FunctionOutputDTO, FunctionService, FunctionUpdateDTO } from './FunctionService.js';
import { IMessageOptsDTO } from '@takaro/gameserver';
import { IParsedCommand, queueService } from '@takaro/queues';
import { Type } from 'class-transformer';
import { TakaroDTO, errors, TakaroModelDTO, traceableClass } from '@takaro/util';
import { ICommand, ICommandArgument, EventChatMessage } from '@takaro/modules';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { SettingsService, SETTINGS_KEYS } from './SettingsService.js';
import { parseCommand } from '../lib/commandParser.js';
import { GameServerService } from './GameServerService.js';
import { PlayerOnGameServerService } from './PlayerOnGameserverService.js';
import { PlayerService } from './PlayerService.js';

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

export class CommandCreateDTO extends TakaroDTO<CommandCreateDTO> implements ICommand {
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

export class CommandArgumentCreateDTO extends TakaroDTO<CommandArgumentCreateDTO> implements ICommandArgument {
  @IsString()
  @Length(2, 50)
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
  position: number;

  @IsUUID()
  @IsOptional()
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

export class CommandTriggerDTO extends TakaroDTO<CommandTriggerDTO> {
  @IsUUID()
  playerId: string;

  @IsString()
  msg: string;
}

@traceableClass('service:command')
export class CommandService extends TakaroService<CommandModel, CommandOutputDTO, CommandCreateDTO, CommandUpdateDTO> {
  get repo() {
    return new CommandRepo(this.domainId);
  }

  async find(filters: ITakaroQuery<CommandOutputDTO>): Promise<PaginatedOutput<CommandOutputDTO>> {
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
      const newFn = await functionsService.create(new FunctionCreateDTO());
      fnIdToAdd = newFn.id;
    }

    const created = await this.repo.create(await new CommandCreateDTO().construct({ ...item, function: fnIdToAdd }));

    if (item.arguments) {
      await Promise.all(
        item.arguments.map(async (a) => {
          return this.createArgument(created.id, await new CommandArgumentCreateDTO().construct(a));
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
          return this.createArgument(id, await new CommandArgumentCreateDTO().construct(a));
        })
      );
    }

    const updated = await this.repo.update(id, item);
    return updated;
  }

  async delete(id: string) {
    await this.repo.delete(id);
    return id;
  }

  async handleChatMessage(chatMessage: EventChatMessage, gameServerId: string) {
    const prefix = await new SettingsService(this.domainId, gameServerId).get(SETTINGS_KEYS.commandPrefix);
    if (!chatMessage.msg.startsWith(prefix)) {
      // Message doesn't start with configured prefix
      // Ignore it
      return;
    }

    const commandName = chatMessage.msg.slice(prefix.length).split(' ')[0];

    const triggeredCommands = await this.repo.getTriggeredCommands(commandName, gameServerId);

    if (triggeredCommands.length) {
      this.log.debug(`Found ${triggeredCommands.length} commands that match the event`);

      if (!chatMessage.player) {
        this.log.error('Chat message does not have a player attached to it');
        throw new errors.InternalServerError();
      }

      const gameServerService = new GameServerService(this.domainId);
      const playerOnGameServerService = new PlayerOnGameServerService(this.domainId);

      const resolvedPlayer = await playerOnGameServerService.resolveRef(chatMessage.player, gameServerId);

      const parsedCommands = await Promise.all(
        triggeredCommands.map(async (c) => {
          let parsedCommand: IParsedCommand | null = null;

          try {
            parsedCommand = await parseCommand(chatMessage.msg, c, gameServerId);
          } catch (error: any) {
            await gameServerService.sendMessage(
              gameServerId,
              error.message,
              await new IMessageOptsDTO().construct({
                recipient: chatMessage.player,
              })
            );
            return;
          }

          return {
            db: c,
            data: {
              timestamp: chatMessage.timestamp,
              ...parsedCommand,
              player: resolvedPlayer,
              module: await gameServerService.getModuleInstallation(gameServerId, c.moduleId),
            },
          };
        })
      );

      const promises = parsedCommands.map(async (command) => {
        if (!command) return;
        const { data, db } = command;

        const commandConfig = data.module.systemConfig.commands[db.name];
        const delay = commandConfig ? commandConfig.delay * 1000 : 0;

        if (delay) {
          await gameServerService.sendMessage(
            gameServerId,
            `Your command will be executed in ${delay / 1000} seconds.`,
            await new IMessageOptsDTO().construct({
              recipient: chatMessage.player,
            })
          );
        }

        return queueService.queues.commands.queue.add(
          {
            timestamp: data.timestamp,
            domainId: this.domainId,
            functionId: db.function.id,
            itemId: db.id,
            player: resolvedPlayer,
            arguments: data.arguments,
            module: data.module,
            gameServerId,
          },
          { delay }
        );
      });

      await Promise.all(promises);
    }
  }

  async trigger(gameServerId: string, triggered: CommandTriggerDTO) {
    const gameServerService = new GameServerService(this.domainId);
    const playerService = new PlayerService(this.domainId);
    const player = await playerService.getRef(triggered.playerId, gameServerId);
    const playerOnGameserver = await gameServerService.getPlayer(gameServerId, player);

    if (!player || !playerOnGameserver) throw new errors.NotFoundError('Player not found');

    const eventDto = await new EventChatMessage().construct({
      player: playerOnGameserver,
      timestamp: new Date(),
      msg: triggered.msg,
    });

    await this.handleChatMessage(eventDto, gameServerId);
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
