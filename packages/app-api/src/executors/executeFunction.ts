import { EXECUTION_MODE } from '@takaro/config';
import { Sentry, errors, logger } from '@takaro/util';
import { Redis } from '@takaro/db';
import { AdminClient, Client } from '@takaro/apiclient';
import { executeFunctionLocal } from './executeLocal.js';
import { IHookJobData, ICommandJobData, ICronJobData, isCommandData, isHookData, isCronData } from '@takaro/queues';
import { executeLambda } from '@takaro/aws';
import { config } from '../config.js';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import { CommandService } from '../service/CommandService.js';
import { PlayerOnGameServerService } from '../service/PlayerOnGameserverService.js';
import { EVENT_TYPES, EventCreateDTO, EventService } from '../service/EventService.js';
import {
  TakaroEventCommandDetails,
  TakaroEventCommandExecuted,
  TakaroEventFunctionLog,
  TakaroEventFunctionResult,
  BaseEvent,
} from '@takaro/modules';

let rateLimiter: RateLimiterRedis | null = null;

const log = logger('worker:function');

const takaro = new AdminClient({
  url: config.get('takaro.url'),
  auth: {
    clientId: config.get('hydra.adminClientId'),
    clientSecret: config.get('hydra.adminClientSecret'),
  },
  OAuth2URL: config.get('hydra.publicUrl'),
  log: logger('adminClient'),
});

interface IFunctionResult {
  success: boolean;
  logs: TakaroEventFunctionLog[];
}

export type FunctionExecutor = (code: string, data: Record<string, unknown>, token: string) => Promise<IFunctionResult>;

async function getJobToken(domainId: string) {
  const tokenRes = await takaro.domain.domainControllerGetToken({
    domainId,
  });

  return tokenRes.data.data.token;
}

export async function executeFunction(
  functionId: string,
  data: IHookJobData | ICommandJobData | ICronJobData,
  domainId: string
) {
  if (!rateLimiter) {
    const redisClient = await Redis.getClient('worker:rateLimiter', { legacyMode: true });
    rateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: 'worker:rateLimiter',
      points: config.get('takaro.functionsRateLimit.points'),
      duration: config.get('takaro.functionsRateLimit.duration') / 1000,
    });
  }

  const token = await getJobToken(domainId);

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
  const meta: Partial<TakaroEventCommandExecuted> = {
    data: dataForEvent,
  };

  const eventData = await new EventCreateDTO().construct({
    moduleId: data.module.moduleId,
    gameserverId: data.gameServerId,
    meta: new BaseEvent(),
  });

  if (isCommandData(data)) {
    const commandService = new CommandService(domainId);
    const command = await commandService.findOne(data.itemId);
    if (!command) throw new errors.InternalServerError();

    eventData.eventName = EVENT_TYPES.COMMAND_EXECUTED;

    meta.command = await new TakaroEventCommandDetails().construct({
      id: command.id,
      name: command.name,
      arguments: data.arguments,
    });

    if (!command) throw new errors.InternalServerError();
    if ('commands' in data.module.systemConfig) {
      const commandsConfig = data.module.systemConfig?.commands as Record<string, any>;
      const cost = commandsConfig[command?.name]?.cost;
      if (cost) {
        if (data.pog.currency < cost) {
          await client.gameserver.gameServerControllerSendMessage(data.gameServerId, {
            message: 'You do not have enough currency to execute this command.',
            opts: {
              recipient: {
                gameId: data.pog.gameId,
              },
            },
          });
          return;
        }
      }
    }
  }

  if (isHookData(data)) {
    eventData.eventName = EVENT_TYPES.HOOK_EXECUTED;
  }

  if (isCronData(data)) {
    eventData.eventName = EVENT_TYPES.CRONJOB_EXECUTED;
  }

  try {
    await rateLimiter.consume(domainId, 1);
    let result: IFunctionResult;
    data.url = config.get('takaro.url');
    switch (config.get('functions.executionMode')) {
      case EXECUTION_MODE.LOCAL:
        result = await executeFunctionLocal(functionRes.data.data.code, data, token);
        meta.result = await new TakaroEventFunctionResult().construct(result);
        break;
      case EXECUTION_MODE.LAMBDA:
        result = await executeLambda({ fn: functionRes.data.data.code, data, token, domainId });
        meta.result = await new TakaroEventFunctionResult().construct(result);
        break;
      default:
        throw new errors.ConfigError(`Invalid execution mode: ${config.get('functions.executionMode')}`);
    }

    if (isCommandData(data) && !result.success) {
      if (
        result.logs.length &&
        (result.logs[result.logs.length - 1].details as unknown as string)?.includes('TakaroUserError')
      ) {
        await client.gameserver.gameServerControllerSendMessage(data.gameServerId, {
          message: result.logs[result.logs.length - 1].msg,
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

    if (!meta.result.logs) meta.result.logs = [];
    // Ensure all logs are TakaroEventFunctionLog
    meta.result.logs = await Promise.all(
      result.logs.map(async (log) => {
        return new TakaroEventFunctionLog().construct(log);
      })
    );

    await eventService.create(await new EventCreateDTO().construct({ ...eventData, meta }));
  } catch (err: any) {
    if (err instanceof RateLimiterRes) {
      log.warn('Function execution rate limited');
      meta.result = await new TakaroEventFunctionResult().construct({
        success: false,
        reason: 'rate limited',
        tryAgainIn: err.msBeforeNext,
      });
      await eventService.create(await new EventCreateDTO().construct({ ...eventData, meta }));
      return null;
    }

    if ('message' in err) {
      meta.result = await new TakaroEventFunctionResult().construct({
        success: false,
        reason: err.message,
      });
    }

    Sentry.captureException(err);
    log.error('executeFunction', err);
    await eventService.create(await new EventCreateDTO().construct({ ...eventData, meta }));
    return null;
  }
}
