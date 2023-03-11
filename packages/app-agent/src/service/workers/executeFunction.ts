import { config, EXECUTION_MODE } from '../../config.js';
import { logger } from '@takaro/util';
import { createContext, runInContext } from 'node:vm';
import Firecracker from '../../lib/firecracker/index.js';
import { VsockClient } from '../../lib/VsockClient.js';

const log = logger('worker:function');

function sleep(ms: number) {
  log.debug(`sleeping for ${ms}ms`);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function executeFunction(
  fn: string,
  data: Record<string, unknown>,
  token: string
) {
  /*  if (config.get('functions.executionMode') === EXECUTION_MODE.LOCAL) {
    return executeLocal(fn, data, token);
  }*/

  log.debug('before start');
  const firecracker = new Firecracker();
  log.debug('before spawn');
  await firecracker.spawn();
  log.debug('before start');
  await firecracker.startVM();
  log.debug('after start');

  await sleep(10_000);

  const vsockClient = new VsockClient(firecracker.options.agentSocket);

  const result = await vsockClient.exec(fn);

  log.debug('HEALLLLLLLLLLLLLLLTHHHHHHHHHHH', result);

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
  log.debug('Executed a local function', { output });
  return { ctx, output };
}
