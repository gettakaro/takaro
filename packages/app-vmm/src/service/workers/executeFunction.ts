import { config, EXECUTION_MODE } from '../../config.js';
import { logger } from '@takaro/util';
import { AdminClient, Client } from '@takaro/apiclient';
import { executeFunctionLocal } from './executeLocal.js';
import { getVMM } from '../vmm/index.js';

const log = logger('worker:function');

const takaro = new AdminClient({
  url: config.get('takaro.url'),
  auth: {
    clientId: config.get('hydra.adminClientId'),
    clientSecret: config.get('hydra.adminClientSecret'),
  },
  OAuth2URL: config.get('hydra.publicUrl'),
});

async function getJobToken(domainId: string) {
  const tokenRes = await takaro.domain.domainControllerGetToken({
    domainId,
  });

  return tokenRes.data.data.token;
}

export async function executeFunction(
  functionId: string,
  data: Record<string, unknown>,
  domainId: string
) {
  const token = await getJobToken(domainId);

  const client = new Client({
    auth: {
      token,
    },
    url: config.get('takaro.url'),
  });

  const functionRes = await client.function.functionControllerGetOne(
    functionId
  );

  try {
    if (config.get('functions.executionMode') === EXECUTION_MODE.LOCAL) {
      return executeFunctionLocal(functionRes.data.data.code, data, token);
    }

    const vmm = await getVMM();
    return await vmm.executeFunction(functionRes.data.data.code, data, token);
  } catch (err) {
    log.error('executeFunction', err);

    return null;
  }
}
