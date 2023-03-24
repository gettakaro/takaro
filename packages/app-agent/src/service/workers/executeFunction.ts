import { config } from '../../config.js';
import { logger } from '@takaro/util';
import { AdminClient } from '@takaro/apiclient';
import { getVMM } from '../../main.js';

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
  fn: string,
  data: Record<string, unknown>,
  domainId: string
) {
  try {
    const vmm = await getVMM();
    const token = await getJobToken(domainId);
    await vmm.executeFunction(fn, data, token);
  } catch (err) {
    log.error('executeFunction', err);

    return null;
  }
}
