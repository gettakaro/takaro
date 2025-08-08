import { GameEvents, GameEventsMapping, EventPayload, EventChatMessage } from '@takaro/modules';
import { ValueOf } from 'type-fest';
import { ModuleInstallationOutputDTO } from '../service/Module/dto.js';
import { PlayerOutputWithRolesDTO } from '../service/Player/dto.js';
import { PlayerOnGameserverOutputWithRolesDTO } from '../service/PlayerOnGameserverService.js';

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
  eventData: EventPayload;
  player?: PlayerOutputWithRolesDTO;
  pog?: PlayerOnGameserverOutputWithRolesDTO;
}

export interface ICommandJobData extends IJobData {
  player: PlayerOutputWithRolesDTO;
  pog: PlayerOnGameserverOutputWithRolesDTO;
  arguments: IParsedCommand['arguments'];
  chatMessage: EventChatMessage;
  trigger: string;
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
  type: ValueOf<typeof GameEvents>;
  gameServerId: string;
  event: ValueOf<(typeof GameEventsMapping)[ValueOf<typeof GameEvents>]>;
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
  options: {
    currency: boolean;
    players: boolean;
    roles: boolean;
    shop: boolean;
  };
}
