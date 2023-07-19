import { getTakaro, checkPermission } from '@takaro/helpers';
import vm, { Module } from 'node:vm';
import { config } from '../../config.js';

/**
 * !!!!!!!!!!!!!!!!!!!!! node:vm is not secure, don't use this in production !!!!!!!!!!!!!!!!!
 */

export async function executeFunctionLocal(fn: string, data: Record<string, unknown>, token: string) {
  data.token = token;
  data.url = config.get('takaro.url');

  const logs = {
    stdout: [] as string[],
    stderr: [] as string[],
  };

  const contextifiedObject = vm.createContext({
    process: { env: { DATA: JSON.stringify(data) } },
    console: {
      log: (...args: string[]) => {
        logs.stdout.push(...args);
      },
      error: (...args: string[]) => {
        logs.stderr.push(...args);
      },
    },
  });

  const toEval = new vm.SourceTextModule(fn, { context: contextifiedObject });
  const monkeyPatchedGetData = () => {
    return data;
  };

  await toEval.link((specifier: string, referencingModule: Module) => {
    const syntheticHelpersModule = new vm.SyntheticModule(
      ['getTakaro', 'getData', 'checkPermission'],
      function () {
        this.setExport('getTakaro', getTakaro);
        this.setExport('checkPermission', checkPermission);
        this.setExport('getData', monkeyPatchedGetData);
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
    if (error instanceof Error) logs.stderr.push(error.message);

    return {
      logs,
      success: false,
    };
  }
}
