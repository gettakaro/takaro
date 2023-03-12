import { logger } from '@takaro/util';
import { createContext, runInContext } from 'node:vm';
import { config, EXECUTION_MODE } from '../../config.js';
import Firecracker from '../../lib/firecracker/index.js';
import { VmClient } from '../../lib/vmClient.js';

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
  if (config.get('functions.executionMode') === EXECUTION_MODE.LOCAL) {
    return executeLocal(fn, data, token);
  }

  const firecracker = new Firecracker({ logLevel: 'debug' });
  await firecracker.spawn();
  await firecracker.startVM();

  // TODO: wait until VM is ready
  await sleep(10_000);

  const vmClient = new VmClient(firecracker.options.agentSocket, 8000);

  const response = await vmClient.exec(fn);

  log.debug('received response: ', response);

  return response;
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
