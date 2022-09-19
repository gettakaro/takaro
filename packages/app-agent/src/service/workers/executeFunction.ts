import { config, EXECUTION_MODE } from '../../config';
import { logger, errors } from '@takaro/logger';
import { ContainerdService } from '../containerd';
const log = logger('worker:function');
import { FunctionOutputDTO, Client } from '@takaro/apiclient';
import { createContext, runInContext } from 'node:vm';

export async function executeFunction(fn: FunctionOutputDTO, client: Client) {
  if (config.get('functions.executionMode') === EXECUTION_MODE.LOCAL) {
    return executeLocal(fn, client);
  }

  throw new errors.NotImplementedError();

  const containerd = new ContainerdService();
  await containerd.pullImage('hello-world');
  const images = await containerd.listImages();
  log.info(images);

  const output = await containerd.runContainer({ image: 'hello-world' });
  log.info(output);
}

/**
 * !!!!!!!!!!!!!!!!!!!!! node:vm is not secure, this is not production ready !!!!!!!!!!!!!!!!!
 *
 */
async function executeLocal(fn: FunctionOutputDTO, client: Client) {
  const ctx = createContext({ client });
  const output = runInContext(fn.code, ctx);
  log.debug('Executed a local function', { output });
  return { ctx, output };
}
