import { GameEvents, EventMapping } from '@takaro/modules';
import { ModuleInstallationOutputDTO, PlayerOnGameserverOutputWithRolesDTO } from '@takaro/apiclient';

export interface IParsedCommand {
  command: string;
  arguments: Record<string, string | number | boolean | PlayerOnGameserverOutputWithRolesDTO>;
  [key: string]: string | Record<string, string | number | boolean | PlayerOnGameserverOutputWithRolesDTO>;
}

export interface IBaseJobData {
  [key: string]: unknown;
  domainId: string;
}

export interface IJobData extends IBaseJobData {
  functionId: string;

  /**
   * The id of the item that triggered this job (cronjobId, commandId or hookId)
   */
  itemId: string;

  /**
   * The id of the gameserver that triggered this job
   */
  gameServerId: string;

  /**
   * The module installation object, including the configs
   */
  module: ModuleInstallationOutputDTO;
}

export interface IHookJobData extends IJobData {
  eventData: EventMapping[keyof EventMapping];
}

export interface ICommandJobData extends IJobData {
  player: PlayerOnGameserverOutputWithRolesDTO;
  arguments: IParsedCommand['arguments'];
}

export type ICronJobData = IJobData;

export function isCommandData(data: IJobData): data is ICommandJobData {
  return 'arguments' in data;
}

export function isHookData(data: IJobData): data is IHookJobData {
  return 'eventData' in data;
}

export function isCronData(data: IJobData): data is ICronJobData {
  return !isCommandData(data) && !isHookData(data);
}

export interface IEventQueueData extends IBaseJobData {
  type: GameEvents;
  gameServerId: string;
  event: EventMapping[GameEvents];
}

export interface IConnectorQueueData extends IBaseJobData {
  gameServerId: string;
  operation: 'create' | 'update' | 'delete';
}

export interface IGameServerQueueData extends IBaseJobData {
  gameServerId?: string;
}

export interface ICSMMImportData extends IBaseJobData {
  csmmExport: Record<string, unknown>;
}
