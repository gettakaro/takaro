import { getTakaro, checkPermission, TakaroUserError, axios, _, nextCronJobRun } from '@takaro/helpers';
import vm from 'node:vm';
import { FunctionExecutor } from './executeFunction.js';
import { config } from '../config.js';
import { TakaroEventFunctionLog } from '@takaro/modules';

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

  const logs: TakaroEventFunctionLog[] = [];

  function pushLog(...args: string[]) {
    // Ugly as unknown  as TakaroEventFunctionLog here
    // Dont want to make this an async function...
    logs.push({ msg: args[0], details: { args: args.slice(1) } } as unknown as TakaroEventFunctionLog);
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
      ['getTakaro', 'checkPermission', 'TakaroUserError', 'getData', 'axios', '_', 'lodash', 'nextCronJobRun'],
      function () {
        this.setExport('getTakaro', monkeyPatchedGetTakaro);
        this.setExport('checkPermission', checkPermission);
        this.setExport('TakaroUserError', TakaroUserError);
        this.setExport('getData', monkeyPatchedGetData);
        this.setExport('axios', axios);
        this.setExport('_', _);
        this.setExport('lodash', _);
        this.setExport('nextCronJobRun', nextCronJobRun);
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
    logs.push(
      await new TakaroEventFunctionLog().construct({ msg: (error as Error).message, details: (error as Error).stack })
    );

    return {
      logs,
      success: false,
    };
  }
};
