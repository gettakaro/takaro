import * as mon from 'monaco-editor';
import customTypes from './monacoCustomTypes.json';

export enum FunctionType {
  Command = 'command',
  Hook = 'hook',
  Cron = 'cron',
}

const DataTypeMap: Record<FunctionType, string> = {
  [FunctionType.Command]: 'ICommandJobData',
  [FunctionType.Hook]: 'IHookJobData',
  [FunctionType.Cron]: 'ICronJobData',
};

export function setExtraLibs(monaco: typeof mon, dataType: FunctionType) {
  const libSource = [
    // eslint-disable-next-line quotes
    "declare module '@takaro/helpers' {",
    `    declare function getData(): Promise<${DataTypeMap[dataType]}>`, // : Promise<ICommandJobData | IHookJobData | ICronJobData>
    `    declare function getTakaro(data: ${DataTypeMap[dataType]}): Promise<Client>;`,
    '    export const axios: Axios',
    '}',
  ].join('\n');
  const libUri = 'file:///node_modules/@takaro/helpers';

  const extraLibs: { content: string; libUri: string }[] = [];

  // add takaro helper types
  extraLibs.push({
    content: libSource,
    libUri,
  });

  // Add other custom types from monacoCustomTypes.json
  // includes the api types, axios, ...
  for (const libUri of Object.keys(customTypes)) {
    const content = customTypes[libUri];
    extraLibs.push({
      content,
      libUri: monaco.Uri.file(libUri).toString(true),
    });
  }
  monaco.languages.typescript.typescriptDefaults.setExtraLibs(extraLibs);
}
