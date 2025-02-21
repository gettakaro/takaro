import { CommandOutputDTO, CronJobOutputDTO, FunctionOutputDTO, HookOutputDTO } from '@takaro/apiclient';

interface File {
  functionId: FunctionOutputDTO['id'];
  type: FileType;
  itemId: CommandOutputDTO['id'] | CronJobOutputDTO['id'] | HookOutputDTO['id'];
  code: string;
  hidden?: boolean;
}

// code is optional here
export type FileWithPath = Omit<File, 'code'> & { path: string; code?: string };

export enum FileType {
  Commands = 'commands',
  Hooks = 'hooks',
  CronJobs = 'cronjobs',
  Functions = 'functions',
}

export type FileMap = Record<string, File>;
