import { TakaroService } from './Base.js';

import { CommandModel, CommandRepo } from '../db/command.js';
import { IsNumber, IsOptional, IsString, IsUUID, Length, ValidateNested } from 'class-validator';
import { FunctionCreateDTO, FunctionOutputDTO, FunctionService, FunctionUpdateDTO } from './FunctionService.js';
import { IMessageOptsDTO } from '@takaro/gameserver';
import { ICommandJobData, IParsedCommand, queueService } from '@takaro/queues';
import { Type } from 'class-transformer';
import { TakaroDTO, errors, TakaroModelDTO, traceableClass } from '@takaro/util';
import { ICommand, ICommandArgument, EventChatMessage, ChatChannel, TakaroEventCommandExecuted } from '@takaro/modules';
import { Redis } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { SettingsService, SETTINGS_KEYS } from './SettingsService.js';
import { parseCommand } from '../lib/commandParser.js';
import { GameServerService } from './GameServerService.js';
import { PlayerService } from './Player/index.js';
import { PlayerOnGameServerService } from './PlayerOnGameserverService.js';
import { UserService } from './User/index.js';
import { ModuleService } from './Module/index.js';
import { InstallModuleDTO } from './Module/dto.js';
import { CommandSearchInputDTO } from '../controllers/CommandController.js';
import { PartialDeep } from 'type-fest/index.js';
import { EventCreateDTO, EventService } from './EventService.js';

export function commandsRunningKey(data: ICommandJobData) {
  return `commands-running:${data.pog.id}:${data.itemId}`;
}

export class CommandOutputDTO extends TakaroModelDTO<CommandOutputDTO> {
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  @Length(1, 131072)
  description?: string;
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
  versionId: string;
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
  @Length(1, 150)
  name: string;
  @IsString()
  @IsOptional()
  @Length(1, 131072)
  description?: string;
  @IsString()
  trigger: string;
  @IsString()
  @IsOptional()
  helpText?: string;
  @IsUUID()
  versionId: string;
  @IsOptional()
  @IsString()
  function: string;
  @Type(() => CommandArgumentCreateDTO)
  @ValidateNested({ each: true })
  @IsOptional()
  arguments: ICommandArgument[];
}

export class CommandArgumentCreateDTO extends TakaroDTO<CommandArgumentCreateDTO> implements ICommandArgument {
  @IsString()
  @Length(1, 150)
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
  @Length(1, 150)
  @IsString()
  @IsOptional()
  name?: string;
  @IsString()
  @IsOptional()
  @Length(1, 131072)
  description?: string;

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
  @Length(1, 150)
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
  private playerService = new PlayerService(this.domainId);
  private gameServerService = new GameServerService(this.domainId);
  private pogService = new PlayerOnGameServerService(this.domainId);
  private moduleService = new ModuleService(this.domainId);

  get repo() {
    return new CommandRepo(this.domainId);
  }

  async find(filters: PartialDeep<CommandSearchInputDTO>): Promise<PaginatedOutput<CommandOutputDTO>> {
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
        new FunctionCreateDTO({
          code: item.function,
        }),
      );
      fnIdToAdd = newFn.id;
    } else {
      const newFn = await functionsService.create(new FunctionCreateDTO());
      fnIdToAdd = newFn.id;
    }

    const toCreate = new CommandCreateDTO({ ...item, function: fnIdToAdd });
    const created = await this.repo.create(toCreate);

    if (item.arguments) {
      await Promise.all(
        item.arguments.map(async (a) => {
          return this.createArgument(created.id, new CommandArgumentCreateDTO(a));
        }),
      );
    }

    await this.moduleService.refreshInstallations(created.versionId);
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
        new FunctionUpdateDTO({
          code: item.function,
        }),
      );
    }

    if (item.arguments) {
      // Delete existing args first
      const existingArgs = existing.arguments;
      await Promise.all(
        existingArgs.map(async (a) => {
          return this.deleteArgument(a.id);
        }),
      );

      // Create new args
      await Promise.all(
        item.arguments.map(async (a) => {
          return this.createArgument(id, new CommandArgumentCreateDTO(a));
        }),
      );
    }

    const updated = await this.repo.update(id, item);

    const installations = await this.moduleService.getInstalledModules({ versionId: updated.versionId });
    await Promise.all(
      installations.map((i) => {
        const newSystemConfig = i.systemConfig;
        const cmdCfg = newSystemConfig.commands[existing.name];
        delete newSystemConfig.commands[existing.name];
        newSystemConfig.commands[updated.name] = cmdCfg;
        return this.moduleService.installModule(
          new InstallModuleDTO({
            gameServerId: i.gameserverId,
            versionId: i.versionId,
            userConfig: JSON.stringify(i.userConfig),
            systemConfig: JSON.stringify(newSystemConfig),
          }),
        );
      }),
    );

    return this.findOne(id);
  }

  async delete(id: string) {
    await this.repo.delete(id);
    return id;
  }

  async handleChatMessage(chatMessage: EventChatMessage, gameServerId: string) {
    const prefix = await new SettingsService(this.domainId, gameServerId).get(SETTINGS_KEYS.commandPrefix);
    if (!chatMessage.msg.startsWith(prefix.value)) {
      // Message doesn't start with configured prefix
      // Ignore it
      return;
    }

    if (!chatMessage.player) {
      this.log.error('Chat message does not have a player attached to it');
      throw new errors.InternalServerError();
    }

    const commandName = chatMessage.msg.slice(prefix.value.length).split(' ')[0];

    if (commandName === 'link') {
      const { player, pog } = await this.playerService.resolveRef(chatMessage.player, gameServerId);
      await this.playerService.handlePlayerLink(player, pog);
      await new EventService(this.domainId).create(
        new EventCreateDTO({
          playerId: player.id,
          gameserverId: gameServerId,
          eventName: 'command-executed',
          meta: new TakaroEventCommandExecuted({
            command: {
              id: 'link',
              name: 'link',
              arguments: {},
            },
          }),
        }),
      );
    }

    const triggeredCommands = await this.repo.getTriggeredCommands(commandName, gameServerId);

    if (triggeredCommands.length) {
      this.log.debug(`Found ${triggeredCommands.length} commands that match the event`);

      const gameServerService = new GameServerService(this.domainId);
      const userService = new UserService(this.domainId);

      const { player, pog } = await this.playerService.resolveRef(chatMessage.player, gameServerId);
      const userRes = await userService.find({ filters: { playerId: [player.id] } });
      const user = userRes.results[0];

      const parsedCommands = await Promise.all(
        triggeredCommands.map(async (c) => {
          let parsedCommand: IParsedCommand | null = null;

          try {
            parsedCommand = await parseCommand(chatMessage.msg, c, gameServerId);
          } catch (error: any) {
            await gameServerService.sendMessage(
              gameServerId,
              error.message,
              new IMessageOptsDTO({
                recipient: chatMessage.player,
              }),
            );
            return;
          }

          return {
            db: c,
            data: {
              timestamp: chatMessage.timestamp,
              ...parsedCommand,
              player: pog,
              modules: await this.moduleService.getInstalledModules({
                gameserverId: gameServerId,
                versionId: c.versionId,
              }),
            },
          };
        }),
      );

      const promises = parsedCommands.map(async (command) => {
        if (!command) return;
        const { data, db } = command;

        for (const mod of data.modules) {
          const commandConfig = mod.systemConfig.commands[db.name];
          if (!mod.systemConfig.enabled) return;
          if (!commandConfig.enabled) return;

          const delay = commandConfig ? commandConfig.delay * 1000 : 0;

          if (delay && commandConfig.announceDelay) {
            await gameServerService.sendMessage(
              gameServerId,
              `Your command will be executed in ${delay / 1000} seconds.`,
              new IMessageOptsDTO({
                recipient: chatMessage.player,
              }),
            );
          }

          const jobData = {
            timestamp: data.timestamp,
            domainId: this.domainId,
            functionId: db.function.id,
            itemId: db.id,
            pog,
            arguments: data.arguments,
            module: mod,
            gameServerId,
            player,
            user,
            chatMessage,
            trigger: commandName,
          };

          const redisClient = await Redis.getClient('worker:command-lock');
          await redisClient.incr(commandsRunningKey(jobData));
          // Also set an expiration for this lock of 2 minutes
          // This prevents the lock from being held forever if the job fails
          await redisClient.expire(commandsRunningKey(jobData), 120);
          await queueService.queues.commands.queue.add(jobData, { delay });
        }
      });

      await Promise.all(promises);
    }
  }

  async trigger(gameServerId: string, triggered: CommandTriggerDTO) {
    const pog = await this.pogService.getPog(triggered.playerId, gameServerId);
    const gamePlayer = await this.gameServerService.getPlayer(gameServerId, pog);

    if (!gamePlayer) throw new errors.NotFoundError('Player not found on gameserver... Make sure the player is online');

    const eventDto = new EventChatMessage({
      player: gamePlayer,
      timestamp: new Date().toISOString(),
      channel: ChatChannel.GLOBAL,
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
