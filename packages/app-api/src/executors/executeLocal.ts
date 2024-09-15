import { getTakaro, checkPermission, TakaroUserError, _, nextCronJobRun } from '@takaro/helpers';
import axios from 'axios';
import vm from 'node:vm';
import { FunctionExecutor } from './executeFunction.js';
import { config } from '../config.js';
import { TakaroEventFunctionLog } from '@takaro/modules';
import { IHookJobData, ICommandJobData, ICronJobData } from '@takaro/queues';

/**
 * !!!!!!!!!!!!!!!!!!!!! node:vm is not secure, don't use this in production !!!!!!!!!!!!!!!!!
 */
export const executeFunctionLocal: FunctionExecutor = async (
  fn: string,
  data: IHookJobData | ICommandJobData | ICronJobData,
  token: string,
) => {
  data.token = token;
  data.url = config.get('takaro.url');

  const logs: TakaroEventFunctionLog[] = [];

  function pushLog(...args: string[]) {
    // Ugly "as unknown  as TakaroEventFunctionLog" here
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

  const { takaro, data: hydratedData } = getTakaro(data, patchedConsole);

  const monkeyPatchedGetData = () => {
    return hydratedData;
  };

  const monkeyPatchedGetTakaro = function () {
    return takaro;
  };

  const userModules = data.module.module.functions
    .filter((f) => f.name)
    .map((f) => ({ name: f.name, code: f.code })) as { name: string; code: string }[];

  await toEval.link(async (specifier: string, referencingModule) => {
    const takaroHelpersModule = new vm.SyntheticModule(
      [
        'getTakaro',
        'checkPermission',
        'TakaroUserError',
        'getData',
        'axios',
        '_',
        'lodash',
        'nextCronJobRun',
        'takaro',
        'data',
      ],
      function () {
        this.setExport('getTakaro', monkeyPatchedGetTakaro);
        this.setExport('checkPermission', checkPermission);
        this.setExport('TakaroUserError', TakaroUserError);
        this.setExport('getData', monkeyPatchedGetData);
        this.setExport('axios', axios);
        this.setExport('_', _);
        this.setExport('lodash', _);
        this.setExport('nextCronJobRun', nextCronJobRun);
        this.setExport('takaro', takaro);
        this.setExport('data', hydratedData);
      },
      { context: referencingModule.context },
    );

    if (specifier === '@takaro/helpers') {
      return takaroHelpersModule;
    } else {
      const userModuleData = userModules.find((m) => `./${m.name}.js` === specifier);
      if (userModuleData) {
        const userModule = new vm.SourceTextModule(userModuleData.code, { context: referencingModule.context });
        await userModule.link(() => {
          return takaroHelpersModule;
        });
        await userModule.evaluate();
        return userModule;
      }
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
    logs.push(new TakaroEventFunctionLog({ msg: (error as Error).message, details: (error as Error).stack }));

    return {
      logs,
      success: false,
    };
  }
};
