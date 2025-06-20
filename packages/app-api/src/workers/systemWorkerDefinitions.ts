import { IBaseJobData } from '@takaro/queues';

export enum SystemTaskType {
  SEED_MODULES = 'seedModules',
  CLEAN_EVENTS = 'cleanEvents',
  CLEAN_EXPIRING_VARIABLES = 'cleanExpiringVariables',
  ENSURE_CRONJOBS_SCHEDULED = 'ensureCronjobsScheduled',
  DELETE_GAME_SERVERS = 'deleteGameServers',
  SYNC_ITEMS = 'syncItems',
  SYNC_ENTITIES = 'syncEntities',
  SYNC_BANS = 'syncBans',
  SYNC_STEAM = 'syncSteam',
}

export const systemTaskDefinitions: Record<SystemTaskType, TaskDefinition> = {
  [SystemTaskType.SEED_MODULES]: { perGameserver: false },
  [SystemTaskType.CLEAN_EVENTS]: { perGameserver: false },
  [SystemTaskType.CLEAN_EXPIRING_VARIABLES]: { perGameserver: false },
  [SystemTaskType.ENSURE_CRONJOBS_SCHEDULED]: { perGameserver: true },
  [SystemTaskType.DELETE_GAME_SERVERS]: { perGameserver: false },
  [SystemTaskType.SYNC_ITEMS]: { perGameserver: true },
  [SystemTaskType.SYNC_ENTITIES]: { perGameserver: true },
  [SystemTaskType.SYNC_BANS]: { perGameserver: true },
  [SystemTaskType.SYNC_STEAM]: { perGameserver: false },
};

export interface ISystemJobData extends IBaseJobData {
  taskType?: SystemTaskType;
  gameServerId?: string;
}

interface TaskDefinition {
  perGameserver: boolean;
}
