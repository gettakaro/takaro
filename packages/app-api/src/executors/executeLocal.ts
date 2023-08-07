import { getTakaro } from '@takaro/helpers';
import vm from 'node:vm';
import axios from 'axios';
import * as _ from 'lodash-es';
import { FunctionExecutor, ILog } from './executeFunction.js';
import { config } from '../config.js';

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

  const contextifiedObject = vm.createContext({
    console: patchedConsole,
  });

  const toEval = new vm.SourceTextModule(fn, { context: contextifiedObject });
  const monkeyPatchedGetData = () => {
    return data;
  };

  const monkeyPatchedGetTakaro = function () {
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
    logs.push({
      msg: (error as Error).message,
      details: (error as Error).stack,
    });

    return {
      logs,
      success: false,
    };
  }
};
