import { config, EXECUTION_MODE } from '../../config';
import { logger, errors } from '@takaro/logger';
import { ContainerdService } from '../containerd';
const log = logger('worker:function');
import { Client } from '@takaro/apiclient';
import { createContext, runInContext } from 'node:vm';

export async function executeFunction(fn: string, client: Client) {
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
async function executeLocal(fn: string, client: Client) {
  const ctx = createContext({ client });
  const output = runInContext(fn, ctx);
  log.debug('Executed a local function', { output });
  return { ctx, output };
}
