import { logger } from '@takaro/util';
import { createContext, runInContext } from 'node:vm';
import { getVMM } from '../../main.js';

const log = logger('worker:function');

export async function executeFunction(
  fn: string,
  data: Record<string, unknown>,
  token: string
) {
  const vmm = await getVMM();

  return await vmm.executeFunction(fn, data, token);
}

/**
 * !!!!!!!!!!!!!!!!!!!!! node:vm is not secure, this is not production ready !!!!!!!!!!!!!!!!!
 *
 */
async function _executeLocal(
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
