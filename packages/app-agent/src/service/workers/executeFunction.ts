import { config, EXECUTION_MODE } from '../../config.js';
import { logger, errors } from '@takaro/util';
import { AdminClient } from '@takaro/apiclient';
const log = logger('worker:function');
import { createContext, runInContext } from 'node:vm';

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
  const token = await getJobToken(domainId);

  if (config.get('functions.executionMode') === EXECUTION_MODE.LOCAL) {
    return executeLocal(fn, data, token);
  }

  throw new errors.NotImplementedError();

  /*   const containerd = new ContainerdService();
    await containerd.pullImage('hello-world');
    const images = await containerd.listImages();
    log.info(images);
  
    const output = await containerd.runContainer({ image: 'hello-world' });
    log.info(output); */
}

/**
 * !!!!!!!!!!!!!!!!!!!!! node:vm is not secure, this is not production ready !!!!!!!!!!!!!!!!!
 *
 */
async function executeLocal(
  fn: string,
  data: Record<string, unknown>,
  token: string
) {
  const ctx = createContext({
    exports: {},
    process: { env: { DATA: data, TOKEN: token } },
  });
  const output = await runInContext(fn, ctx);
  log.info('Executed a local function', { output });
  return { ctx, output };
}
