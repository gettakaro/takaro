import { GameEvents, EventMapping } from '@takaro/gameserver';

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
   * Additional data that can be passed to the job
   * Typically, this depends on what triggered the job
   */
  data?: Record<string, unknown> | EventMapping[GameEvents];
}

export interface IEventQueueData extends IBaseJobData {
  type: GameEvents;
  gameServerId: string;
  event: EventMapping[GameEvents];
}
