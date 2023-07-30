import { getTakaro } from '@takaro/helpers';
import vm from 'node:vm';
import { config } from '../../config.js';
import axios from 'axios';
import * as _ from 'lodash-es';
import { FunctionExecutor, ILog } from './executeFunction.js';

/**
 * !!!!!!!!!!!!!!!!!!!!! node:vm is not secure, don't use this in production !!!!!!!!!!!!!!!!!
 */
export const executeFunctionLocal: FunctionExecutor = async (
  fn: string,
  data: Record<string, unknown>,
  token: string
) => {
  data.token = token;
  data.url = config.get('takaro.url');

  const logs: ILog[] = [];

  const toEval = new vm.SourceTextModule(fn);
  const monkeyPatchedGetData = () => {
    return data;
  };

  const monkeyPatchedGetTakaro = function () {
    function pushLog(...args: string[]) {
      logs.push({ msg: args[0], details: { args: args.slice(1) } });
    }
    const patchedConsole = {
      log: pushLog,
      error: pushLog,
      warn: pushLog,
      info: pushLog,
      debug: pushLog,
    };
    return getTakaro(data, patchedConsole);
  };

  await toEval.link((specifier: string, referencingModule) => {
    const syntheticHelpersModule = new vm.SyntheticModule(
      ['getTakaro', 'getData', 'axios', '_', 'lodash'],
      function () {
        this.setExport('getTakaro', monkeyPatchedGetTakaro);
        this.setExport('getData', monkeyPatchedGetData);
        this.setExport('axios', axios);
        this.setExport('_', _);
        this.setExport('lodash', _);
      },
      { context: referencingModule.context }
    );

    if (specifier === '@takaro/helpers') {
      return syntheticHelpersModule;
    }

    throw new Error(`Unable to resolve dependency: ${specifier}`);
  });

  try {
    await toEval.evaluate();
    return {
      logs,
      success: true,
    };
  } catch (error) {
    if (error instanceof Error)
      logs.push({
        msg: error.message,
        details: error.stack,
      });

    return {
      logs,
      success: false,
    };
  }
};
