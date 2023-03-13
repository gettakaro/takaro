import { config, EXECUTION_MODE } from '../../config.js';
import { logger, errors } from '@takaro/util';
const log = logger('worker:function');
import { createContext, runInContext } from 'node:vm';

export async function executeFunction(
  fn: string,
  data: Record<string, unknown>,
  token: string
) {
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
