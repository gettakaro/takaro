import { config, EXECUTION_MODE } from '../../config.js';
import { errors, logger } from '@takaro/util';
import { AdminClient, Client, EventCreateDTO } from '@takaro/apiclient';
import { executeFunctionLocal } from './executeLocal.js';
import { getVMM } from '../vmm/index.js';
import { IHookJobData, ICommandJobData, ICronJobData, isCommandData, isHookData, isCronData } from '@takaro/queues';
import { executeLambda } from '@takaro/aws';

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
    let result;

    switch (config.get('functions.executionMode')) {
      case EXECUTION_MODE.LOCAL:
        result = await executeFunctionLocal(functionRes.data.data.code, data, token);
        eventData.meta['result'] = result;
        break;
      case EXECUTION_MODE.FIRECRACKER:
        const vmm = await getVMM();
        result = await vmm.executeFunction(functionRes.data.data.code, data, token);
        eventData.meta['result'] = result;
      case EXECUTION_MODE.LAMBDA:
        await executeLambda({ fn: functionRes.data.data.code, data, token, domainId });
        break;
      default:
        throw new errors.ConfigError(`Invalid execution mode: ${config.get('functions.executionMode')}`);
        break;
    }

    await client.event.eventControllerCreate(eventData);
  } catch (err) {
    log.error('executeFunction', err);
    await client.event.eventControllerCreate(eventData);
    return null;
  }
}
