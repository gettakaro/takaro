import { EXECUTION_MODE } from '@takaro/config';
import { Sentry, errors, logger } from '@takaro/util';
import { Redis } from '@takaro/db';
import { AdminClient, Client, EventCreateDTO } from '@takaro/apiclient';
import { executeFunctionLocal } from './executeLocal.js';
import { IHookJobData, ICommandJobData, ICronJobData, isCommandData, isHookData, isCronData } from '@takaro/queues';
import { executeLambda } from '@takaro/aws';
import { config } from '../config.js';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';

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

export interface ILog {
  msg: string;
  details?: Record<string, unknown> | string;
}

interface IFunctionResult {
  success: boolean;
  logs: ILog[];
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
      points: 1000,
      duration: 60 * 60,
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

  const eventData: EventCreateDTO & { meta: Record<string, unknown> } = {
    eventName: '',
    moduleId: data.module.moduleId,
    gameserverId: data.gameServerId,
    meta: {},
  };

  if (isCommandData(data)) {
    eventData.playerId = data.player.playerId;
    eventData.eventName = 'command-executed';
    eventData.meta['command'] = {
      command: data.itemId,
      arguments: data.arguments,
    };
  }

  if (isHookData(data)) {
    eventData.eventName = 'hook-executed';
    eventData.meta['eventData'] = data.eventData;
  }

  if (isCronData(data)) {
    eventData.eventName = 'cronjob-executed';
  }

  try {
    await rateLimiter.consume(domainId, 1);
    let result: IFunctionResult;
    data.url = config.get('takaro.url');
    switch (config.get('functions.executionMode')) {
      case EXECUTION_MODE.LOCAL:
        result = await executeFunctionLocal(functionRes.data.data.code, data, token);
        eventData.meta['result'] = result;
        break;
      case EXECUTION_MODE.LAMBDA:
        result = await executeLambda({ fn: functionRes.data.data.code, data, token, domainId });
        eventData.meta['result'] = result;
        break;
      default:
        throw new errors.ConfigError(`Invalid execution mode: ${config.get('functions.executionMode')}`);
    }

    if (isCommandData(data) && !result.success) {
      await client.gameserver.gameServerControllerSendMessage(data.gameServerId, {
        message: 'Oops, something went wrong while executing your command. Please try again later.',
        opts: {
          recipient: {
            gameId: data.player.gameId,
          },
        },
      });
    }

    await client.event.eventControllerCreate(eventData);
  } catch (err: any) {
    if (err instanceof RateLimiterRes) {
      log.warn('Function execution rate limited');
      eventData.meta['result'] = {
        success: false,
        reason: 'rate limited',
        tryAgainIn: err.msBeforeNext,
      };
      await client.event.eventControllerCreate(eventData);
      return null;
    }

    if ('message' in err) {
      eventData.meta['result'] = {
        success: false,
        reason: err.message,
      };
    }

    Sentry.captureException(err);
    log.error('executeFunction', err);
    await client.event.eventControllerCreate(eventData);
    return null;
  }
}
