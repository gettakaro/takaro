import {
  CommandOutputDTO,
  CronJobOutputDTO,
  FunctionOutputDTO,
  HookOutputDTO,
} from '@takaro/apiclient';
import { Dispatch, createContext } from 'react';

export interface IModuleContext {
  moduleData: ModuleData;
  setModuleData: Dispatch<ModuleData>;
}

type FilePath = string;

export enum FunctionType {
  Commands = 'commands',
  Hooks = 'hooks',
  CronJobs = 'cronjobs',
}

export interface ModuleItemProperties {
  functionId: FunctionOutputDTO['id'];
  type: FunctionType;
  itemId: CommandOutputDTO['id'] | CronJobOutputDTO['id'] | HookOutputDTO['id'];
  code: string;
}

export interface ModuleData {
  id: string;
  name: string;
  isBuiltIn?: boolean;
  fileMap: Record<FilePath, ModuleItemProperties>;
}

export const ModuleContext = createContext<IModuleContext>(undefined!);
