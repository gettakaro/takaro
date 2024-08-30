import { EXECUTION_MODE } from '@takaro/config';
import { Sentry, errors, logger } from '@takaro/util';
import { Redis } from '@takaro/db';
import { AdminClient, Client } from '@takaro/apiclient';
import { executeFunctionLocal } from './executeLocal.js';
import { IHookJobData, ICommandJobData, ICronJobData, isCommandData, isHookData, isCronData } from '@takaro/queues';
import { executeLambda } from '@takaro/aws';
import { config } from '../config.js';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import { commandsRunningKey, CommandService } from '../service/CommandService.js';
import { PlayerOnGameServerService } from '../service/PlayerOnGameserverService.js';
import { EVENT_TYPES, EventCreateDTO, EventService } from '../service/EventService.js';
import {
  TakaroEventCommandDetails,
  TakaroEventCommandExecuted,
  TakaroEventFunctionLog,
  TakaroEventFunctionResult,
  BaseEvent,
  TakaroEventHookExecuted,
  TakaroEventCronjobExecuted,
  TakaroEventHookDetails,
  TakaroEventCronjobDetails,
} from '@takaro/modules';
import { HookService } from '../service/HookService.js';
import { CronJobService } from '../service/CronJobService.js';
import { GameServerService } from '../service/GameServerService.js';
import { IMessageOptsDTO, IPlayerReferenceDTO } from '@takaro/gameserver';

const rateLimiterMap: Map<string, RateLimiterRedis> = new Map();

const log = logger('worker:function');

const takaro = new AdminClient({
  url: config.get('takaro.url'),
  auth: {
    clientSecret: config.get('adminClientSecret'),
  },
  log: logger('adminClient'),
});

interface IFunctionResult {
  success: boolean;
  logs: TakaroEventFunctionLog[];
}

export type FunctionExecutor = (
  code: string,
  data: IHookJobData | ICommandJobData | ICronJobData,
  token: string,
) => Promise<IFunctionResult>;

async function getJobToken(domainId: string) {
  const tokenRes = await takaro.domain.domainControllerGetToken({
    domainId,
  });

  return tokenRes.data.data.token;
}

async function getRateLimiter(domainId: string) {
  const existingRateLimiter = rateLimiterMap.get(domainId);
  if (existingRateLimiter) return existingRateLimiter;

  log.debug(`Creating new function rate limiter for domain ${domainId}`);

  const domainRes = await takaro.domain.domainControllerGetOne(domainId);
  const domain = domainRes.data.data;

  if (!domain) {
    log.error('executeFunction: Domain not found');
    throw new errors.NotFoundError();
  }

  const redisClient = await Redis.getClient('worker:rateLimiter', { legacyMode: true });
  const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'worker:rateLimiter',
    points: domain.rateLimitPoints,
    duration: domain.rateLimitDuration / 1000,
  });

  rateLimiterMap.set(domainId, rateLimiter);
  return rateLimiter;
}

export async function executeFunction(
  functionId: string,
  data: IHookJobData | ICommandJobData | ICronJobData,
  domainId: string,
) {
  const rateLimiter = await getRateLimiter(domainId);
  const token = await getJobToken(domainId);
  const redisClient = await Redis.getClient('worker:command-lock');

  const client = new Client({
    auth: {
      token,
    },
    url: config.get('takaro.url'),
    log: logger('domainClient'),
  });

  const functionRes = await client.function.functionControllerGetOne(functionId);
  const eventService = new EventService(domainId);

  const dataForEvent = { ...data };
  delete dataForEvent.token;
  delete dataForEvent.url;
  const meta: Partial<TakaroEventCommandExecuted | TakaroEventHookExecuted | TakaroEventCronjobExecuted> = {
    data: dataForEvent,
  };

  const eventData = new EventCreateDTO({
    moduleId: data.module.moduleId,
    gameserverId: data.gameServerId,
    meta: new BaseEvent(),
  });

  if (isCommandData(data)) {
    const gameserverService = new GameServerService(domainId);
    const commandService = new CommandService(domainId);
    const command = await commandService.findOne(data.itemId);
    if (!command) throw new errors.InternalServerError();

    eventData.eventName = EVENT_TYPES.COMMAND_EXECUTED;

    (meta as TakaroEventCommandExecuted).command = new TakaroEventCommandDetails({
      id: command.id,
      name: command.name,
      arguments: data.arguments,
    });

    if (!command) throw new errors.InternalServerError();
    if ('commands' in data.module.systemConfig) {
      // Handle cost
      const commandsConfig = data.module.systemConfig?.commands as Record<string, any>;
      const cost = commandsConfig[command?.name]?.cost;
      if (cost) {
        if (data.pog.currency < cost) {
          await gameserverService.sendMessage(
            data.gameServerId,
            'You do not have enough currency to execute this command.',
            new IMessageOptsDTO({
              recipient: new IPlayerReferenceDTO({
                gameId: data.pog.gameId,
              }),
            }),
          );
          return;
        }
      }

      // Handle cooldown
      const cooldown = commandsConfig[command?.name]?.cooldown;
      const redisRes = (await redisClient.get(commandsRunningKey(data))) ?? '0';
      await redisClient.decr(commandsRunningKey(data));
      const commandsRunning = parseInt(redisRes, 10);

      if (cooldown) {
        if (commandsRunning > 1) {
          log.warn(
            `Player ${data.player.id} tried to execute command ${data.itemId} but the command is already running ${commandsRunning} times`,
          );

          await gameserverService.sendMessage(
            data.gameServerId,
            'You can only execute one command at a time. Please wait for the previous command to finish.',
            new IMessageOptsDTO({
              recipient: new IPlayerReferenceDTO({
                gameId: data.pog.gameId,
              }),
            }),
          );

          return;
        }

        const lastExecution = await eventService.metadataSearch(
          {
            filters: {
              playerId: [data.player.id],
              gameserverId: [data.gameServerId],
              eventName: [EVENT_TYPES.COMMAND_EXECUTED],
            },
            greaterThan: {
              createdAt: new Date(Date.now() - cooldown * 1000),
            },
          },
          [
            {
              logicalOperator: 'AND',
              filters: [{ field: 'command.id', operator: '=', value: data.itemId }],
            },
          ],
        );

        if (lastExecution.results.length) {
          log.warn(
            `Player ${data.player.id} tried to execute command ${data.itemId} but the cooldown hasn't passed yet`,
          );

          const lastExecutionDate = new Date(lastExecution.results[0].createdAt);
          const timeWhenCanExecute = new Date(lastExecutionDate.getTime() + cooldown * 1000);

          const gameserverService = new GameServerService(domainId);
          await gameserverService.sendMessage(
            data.gameServerId,
            `This command can only be executed once every ${cooldown} seconds. You can execute it again at ${timeWhenCanExecute.toISOString()}`,
            new IMessageOptsDTO({
              recipient: new IPlayerReferenceDTO({ gameId: data.pog.gameId }),
            }),
          );
          return;
        }
      }
    }
  }

  if (isHookData(data)) {
    eventData.eventName = EVENT_TYPES.HOOK_EXECUTED;
    const hookService = new HookService(domainId);
    const hook = await hookService.findOne(data.itemId);
    if (!hook) throw new errors.InternalServerError();

    (meta as TakaroEventHookExecuted).hook = new TakaroEventHookDetails({
      id: hook.id,
      name: hook.name,
    });
  }

  if (isCronData(data)) {
    eventData.eventName = EVENT_TYPES.CRONJOB_EXECUTED;
    const cronService = new CronJobService(domainId);
    const cron = await cronService.findOne(data.itemId);
    if (!cron) throw new errors.InternalServerError();

    (meta as TakaroEventCronjobExecuted).cronjob = new TakaroEventCronjobDetails({
      id: cron.id,
      name: cron.name,
    });
  }

  try {
    await rateLimiter.consume(domainId, 1);
    let result: IFunctionResult;
    data.url = config.get('takaro.url');
    switch (config.get('functions.executionMode')) {
      case EXECUTION_MODE.LOCAL:
        result = await executeFunctionLocal(functionRes.data.data.code, data, token);
        meta.result = new TakaroEventFunctionResult(result);
        break;
      case EXECUTION_MODE.LAMBDA:
        result = await executeLambda({ fn: functionRes.data.data.code, data, token, domainId });
        meta.result = new TakaroEventFunctionResult(result);
        break;
      default:
        throw new errors.ConfigError(`Invalid execution mode: ${config.get('functions.executionMode')}`);
    }

    if (isCommandData(data) && !result.success) {
      if (
        result.logs &&
        result.logs.length &&
        (result.logs[result.logs.length - 1].details as unknown as string)?.includes('TakaroUserError')
      ) {
        const msg = result.logs[result.logs.length - 1].msg;
        await client.gameserver.gameServerControllerSendMessage(data.gameServerId, {
          message: msg ?? 'User error but no details provided',
          opts: {
            recipient: {
              gameId: data.pog.gameId,
            },
          },
        });
      } else {
        await client.gameserver.gameServerControllerSendMessage(data.gameServerId, {
          message: 'Oops, something went wrong while executing your command. Please try again later.',
          opts: {
            recipient: {
              gameId: data.pog.gameId,
            },
          },
        });
      }
    }

    if (isCommandData(data)) {
      const commandService = new CommandService(domainId);
      const command = await commandService.findOne(data.itemId);
      if (!command) throw new errors.InternalServerError();

      eventData.playerId = data.pog.playerId;

      if ('commands' in data.module.systemConfig) {
        const commandsConfig = data.module.systemConfig?.commands as Record<string, any>;
        const cost = commandsConfig[command?.name]?.cost;
        if (cost) {
          if (!result.success) {
            log.warn('Command execution failed, not deducting cost');
          } else {
            const playerOnGameServerService = new PlayerOnGameServerService(domainId);
            await playerOnGameServerService.deductCurrency(data.pog.id, cost);
          }
        }
      }
    }

    if (!result.logs) result.logs = [];
    if (!meta.result.logs) meta.result.logs = [];
    // Ensure all logs are TakaroEventFunctionLog
    meta.result.logs = await Promise.all(
      result.logs.map(async (log) => {
        return new TakaroEventFunctionLog(log);
      }),
    );

    await eventService.create(new EventCreateDTO({ ...eventData, meta }));
  } catch (err: any) {
    if (err instanceof RateLimiterRes) {
      log.warn('Function execution rate limited');
      meta.result = new TakaroEventFunctionResult({
        success: false,
        reason: 'rate limited',
        tryAgainIn: err.msBeforeNext,
      });
      await eventService.create(new EventCreateDTO({ ...eventData, meta }));
      return null;
    }

    if ('message' in err) {
      meta.result = new TakaroEventFunctionResult({
        success: false,
        reason: err.message,
      });
    }

    if (err.constructor.name === 'SyntaxError') {
      meta.result = new TakaroEventFunctionResult({
        success: false,
        reason: `SyntaxError: ${err.message}. Your javascript code is invalid.`,
      });
    }

    Sentry.captureException(err);
    log.error('executeFunction', err);
    await eventService.create(new EventCreateDTO({ ...eventData, meta }));
    return null;
  }
}
