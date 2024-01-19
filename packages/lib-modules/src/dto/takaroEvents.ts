import { IsDate, IsEnum, IsString } from 'class-validator';
import { BaseEvent } from './base.js';
import { ValueOf } from 'type-fest';

export const TakaroEvents = {
  ROLE_ASSIGNED: 'role-assigned',
  ROLE_REMOVED: 'role-removed',
  ROLE_CREATED: 'role-created',
  ROLE_UPDATED: 'role-updated',
  ROLE_DELETED: 'role-deleted',
  COMMAND_EXECUTED: 'command-executed',
  HOOK_EXECUTED: 'hook-executed',
  CRONJOB_EXECUTED: 'cronjob-executed',
  CURRENCY_ADDED: 'currency-added',
  CURRENCY_DEDUCTED: 'currency-deducted',
  SETTINGS_SET: 'settings-set',
  PLAYER_NEW_IP_DETECTED: 'player-new-ip-detected',
} as const;

export class BaseTakaroEvent<T> extends BaseEvent<T> {
  @IsDate()
  timestamp: Date = new Date();

  @IsEnum(TakaroEvents)
  declare type: ValueOf<typeof TakaroEvents>;

  @IsString()
  msg: string;
}

export class TakaroEventRoleAssigned extends BaseEvent<TakaroEventRoleAssigned> {
  @IsString()
  type = TakaroEvents.ROLE_ASSIGNED;
}

export const TakaroEventsMapping = {
  [TakaroEvents.ROLE_ASSIGNED]: TakaroEventRoleAssigned,

  // TODO: should type these properly
  [TakaroEvents.ROLE_REMOVED]: TakaroEventRoleAssigned,
  [TakaroEvents.ROLE_CREATED]: TakaroEventRoleAssigned,
  [TakaroEvents.ROLE_UPDATED]: TakaroEventRoleAssigned,
  [TakaroEvents.ROLE_DELETED]: TakaroEventRoleAssigned,
  [TakaroEvents.COMMAND_EXECUTED]: TakaroEventRoleAssigned,
  [TakaroEvents.HOOK_EXECUTED]: TakaroEventRoleAssigned,
  [TakaroEvents.CRONJOB_EXECUTED]: TakaroEventRoleAssigned,
  [TakaroEvents.CURRENCY_ADDED]: TakaroEventRoleAssigned,
  [TakaroEvents.CURRENCY_DEDUCTED]: TakaroEventRoleAssigned,
  [TakaroEvents.SETTINGS_SET]: TakaroEventRoleAssigned,
  [TakaroEvents.PLAYER_NEW_IP_DETECTED]: TakaroEventRoleAssigned,
} as const;
