import { config, EXECUTION_MODE } from '../../config.js';
import { logger } from '@takaro/util';
const log = logger('worker:function');
import { createContext, runInContext } from 'node:vm';
import Firecracker from '../../lib/firecracker/index.js';
import { VsockClient } from '../../lib/VsockClient.js';

export async function executeFunction(
  fn: string,
  data: Record<string, unknown>,
  token: string
) {
  /*  if (config.get('functions.executionMode') === EXECUTION_MODE.LOCAL) {
    return executeLocal(fn, data, token);
  }*/

  console.log('before start');
  const firecracker = new Firecracker();
  console.log('before spawn');
  await firecracker.spawn();
  console.log('before setup');
  await firecracker.setupVM();
  console.log('before start');
  await firecracker.startVM();
  console.log('after start');

  const vsockClient = new VsockClient();
  const result = await vsockClient.getHealth();
  console.log('HEALLLLLLLLLLLLLLLTHHHHHHHHHHH', result);

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
