import {
  IsBoolean,
  IsEnum,
  IsIP,
  IsISO31661Alpha2,
  IsJSON,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { BaseEvent } from './base.js';
import { ValueOf } from 'type-fest';
import { Type } from 'class-transformer';
import { TakaroDTO } from '@takaro/util';

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
  SERVER_STATUS_CHANGED: 'server-status-changed',
  MODULE_CREATED: 'module-created',
  MODULE_UPDATED: 'module-updated',
  MODULE_DELETED: 'module-deleted',
  MODULE_INSTALLED: 'module-installed',
  MODULE_UNINSTALLED: 'module-uninstalled',
  PLAYER_CREATED: 'player-created',
  SHOP_LISTING_CREATED: 'shop-listing-created',
  SHOP_LISTING_UPDATED: 'shop-listing-updated',
  SHOP_LISTING_DELETED: 'shop-listing-deleted',
  SHOP_ORDER_CREATED: 'shop-order-created',
  SHOP_ORDER_STATUS_CHANGED: 'shop-order-status-changed',
  SHOP_ORDER_DELIVERY_FAILED: 'shop-order-delivery-failed',
  PLAYER_LINKED: 'player-linked',
  GAMESERVER_CREATED: 'gameserver-created',
  GAMESERVER_UPDATED: 'gameserver-updated',
  GAMESERVER_DELETED: 'gameserver-deleted',
} as const;

export class BaseTakaroEvent<T> extends BaseEvent<T> {
  @IsEnum(TakaroEvents)
  declare type: ValueOf<typeof TakaroEvents>;

  @IsString()
  msg: string;
}

export class TakaroEventPlayerNewIpDetected extends BaseEvent<TakaroEventPlayerNewIpDetected> {
  @IsString()
  type = TakaroEvents.PLAYER_NEW_IP_DETECTED;

  @IsISO31661Alpha2()
  country: string;

  @IsString()
  city: string;

  @IsString()
  longitude: string;

  @IsString()
  latitude: string;

  @IsIP()
  ip: string;
}

export class TakaroEventCurrencyDeducted extends BaseEvent<TakaroEventCurrencyDeducted> {
  @IsString()
  type = TakaroEvents.CURRENCY_DEDUCTED;

  @IsNumber()
  amount: number;
}

export class TakaroEventCurrencyAdded extends BaseEvent<TakaroEventCurrencyAdded> {
  @IsString()
  type = TakaroEvents.CURRENCY_ADDED;

  @IsNumber()
  amount: number;
}

export class TakaroEventFunctionResult extends TakaroDTO<TakaroEventFunctionResult> {
  @ValidateNested({ each: true })
  @Type(() => TakaroEventFunctionLog)
  logs: TakaroEventFunctionLog[];

  @IsBoolean()
  success: boolean;

  @IsString()
  @IsOptional()
  reason: string;

  @IsNumber()
  @IsOptional()
  tryAgainIn: number;
}

export class TakaroEventFunctionLog extends TakaroDTO<TakaroEventFunctionLog> {
  @IsString()
  msg: string;

  @IsOptional()
  details: Record<string, unknown> | string | undefined;
}

export class TakaroEventCommandDetails extends TakaroDTO<TakaroEventCommandDetails> {
  @IsString()
  id: string;
  @IsString()
  name: string;
  @IsObject()
  arguments: Record<string, unknown>;
}

export class TakaroEventHookDetails extends TakaroDTO<TakaroEventHookDetails> {
  @IsString()
  id: string;
  @IsString()
  name: string;
}

export class TakaroEventCronjobDetails extends TakaroDTO<TakaroEventCronjobDetails> {
  @IsString()
  id: string;
  @IsString()
  name: string;
}

export class TakaroEventCommandExecuted extends BaseEvent<TakaroEventCommandExecuted> {
  @IsString()
  type = TakaroEvents.COMMAND_EXECUTED;

  @ValidateNested()
  @Type(() => TakaroEventFunctionResult)
  result: TakaroEventFunctionResult;

  @IsOptional()
  @ValidateNested()
  @Type(() => TakaroEventCommandDetails)
  command: TakaroEventCommandDetails;
}

export class TakaroEventHookExecuted extends BaseEvent<TakaroEventHookExecuted> {
  @IsString()
  type = TakaroEvents.HOOK_EXECUTED;

  @ValidateNested()
  @Type(() => TakaroEventFunctionResult)
  result: TakaroEventFunctionResult;

  @IsOptional()
  @ValidateNested()
  @Type(() => TakaroEventHookDetails)
  hook: TakaroEventHookDetails;
}

export class TakaroEventCronjobExecuted extends BaseEvent<TakaroEventCronjobExecuted> {
  @IsString()
  type = TakaroEvents.CRONJOB_EXECUTED;

  @ValidateNested()
  @Type(() => TakaroEventFunctionResult)
  result: TakaroEventFunctionResult;

  @IsOptional()
  @ValidateNested()
  @Type(() => TakaroEventCronjobDetails)
  cronjob: TakaroEventCronjobDetails;
}

export class TakaroEventRoleMeta extends TakaroDTO<TakaroEventRoleMeta> {
  @IsString()
  id: string;
  @IsString()
  name: string;
}

export class TakaroEventRoleAssigned extends BaseEvent<TakaroEventRoleAssigned> {
  @IsString()
  type = TakaroEvents.ROLE_ASSIGNED;

  @ValidateNested()
  @Type(() => TakaroEventRoleMeta)
  role: TakaroEventRoleMeta;
}

export class TakaroEventRoleRemoved extends BaseEvent<TakaroEventRoleRemoved> {
  @IsString()
  type = TakaroEvents.ROLE_REMOVED;

  @ValidateNested()
  @Type(() => TakaroEventRoleMeta)
  role: TakaroEventRoleMeta;
}

export class TakaroEventRoleCreated extends BaseEvent<TakaroEventRoleCreated> {
  @IsString()
  type = TakaroEvents.ROLE_CREATED;

  @ValidateNested()
  @Type(() => TakaroEventRoleMeta)
  role: TakaroEventRoleMeta;
}

export class TakaroEventRoleUpdated extends BaseEvent<TakaroEventRoleUpdated> {
  @IsString()
  type = TakaroEvents.ROLE_UPDATED;

  @ValidateNested()
  @Type(() => TakaroEventRoleMeta)
  role: TakaroEventRoleMeta;
}

export class TakaroEventRoleDeleted extends BaseEvent<TakaroEventRoleDeleted> {
  @IsString()
  type = TakaroEvents.ROLE_DELETED;

  @ValidateNested()
  @Type(() => TakaroEventRoleMeta)
  role: TakaroEventRoleMeta;
}

export class TakaroEventSettingsSet extends BaseEvent<TakaroEventSettingsSet> {
  @IsString()
  type = TakaroEvents.SETTINGS_SET;

  @IsString()
  key: string;

  @IsString()
  @IsOptional()
  value: string | null;
}

export class TakaroEventServerStatusChanged extends BaseEvent<TakaroEventServerStatusChanged> {
  @IsString()
  type = TakaroEvents.SERVER_STATUS_CHANGED;

  @IsString()
  status: string;

  @IsOptional()
  details?: Record<string, unknown> | string | null;
}

export class TakaroEventModuleCreated extends BaseEvent<TakaroEventModuleCreated> {
  @IsString()
  type = TakaroEvents.MODULE_CREATED;
}

export class TakaroEventModuleUpdated extends BaseEvent<TakaroEventModuleUpdated> {
  @IsString()
  type = TakaroEvents.MODULE_UPDATED;
}

export class TakaroEventModuleDeleted extends BaseEvent<TakaroEventModuleDeleted> {
  @IsString()
  type = TakaroEvents.MODULE_DELETED;
}

export class TakaroEventModuleInstalled extends BaseEvent<TakaroEventModuleInstalled> {
  @IsString()
  type = TakaroEvents.MODULE_INSTALLED;

  @IsJSON()
  userConfig: string;

  @IsJSON()
  systemConfig: string;
}

export class TakaroEventModuleUninstalled extends BaseEvent<TakaroEventModuleUninstalled> {
  @IsString()
  type = TakaroEvents.MODULE_UNINSTALLED;
}
export class TakaroEventPlayerCreated extends BaseEvent<TakaroEventPlayerCreated> {
  @IsString()
  type = TakaroEvents.PLAYER_CREATED;
}

export class TakaroEventShopListingCreated extends BaseEvent<TakaroEventShopListingCreated> {
  @IsString()
  type = TakaroEvents.SHOP_LISTING_CREATED;
  @IsUUID()
  id: string;
}

export class TakaroEventShopListingUpdated extends BaseEvent<TakaroEventShopListingUpdated> {
  @IsString()
  type = TakaroEvents.SHOP_LISTING_UPDATED;
  @IsUUID()
  id: string;
}

export class TakaroEventShopListingDeleted extends BaseEvent<TakaroEventShopListingDeleted> {
  @IsString()
  type = TakaroEvents.SHOP_LISTING_DELETED;
  @IsUUID()
  id: string;
}

export class TakaroEventShopOrderCreated extends BaseEvent<TakaroEventShopOrderCreated> {
  @IsString()
  type = TakaroEvents.SHOP_ORDER_CREATED;
  @IsUUID()
  id: string;
  @IsString()
  listingName: string;
  @IsNumber()
  price: number;
  @IsNumber()
  amount: number;
  @IsNumber()
  totalPrice: number;
  @ValidateNested({ each: true })
  @Type(() => TakaroEventShopItem)
  @IsOptional()
  items?: TakaroEventShopItem[];
}

export class TakaroEventShopItem extends TakaroDTO<TakaroEventShopItem> {
  @IsString()
  name: string;
  @IsString()
  code: string;
  @IsNumber()
  amount: number;
  @IsString()
  @IsOptional()
  quality?: string;
}

export class TakaroEventShopOrderStatusChanged extends BaseEvent<TakaroEventShopOrderStatusChanged> {
  @IsString()
  type = TakaroEvents.SHOP_ORDER_STATUS_CHANGED;
  @IsUUID()
  id: string;
  @IsString()
  status: string;
}

export class TakaroEventShopOrderDeliveryFailed extends BaseEvent<TakaroEventShopOrderDeliveryFailed> {
  @IsString()
  type = TakaroEvents.SHOP_ORDER_DELIVERY_FAILED;
  @IsUUID()
  id: string;
  @IsString()
  error: string;
  @ValidateNested({ each: true })
  @Type(() => TakaroEventShopItem)
  items: TakaroEventShopItem[];
}

export class TakaroEventPlayerLinked extends BaseEvent<TakaroEventPlayerLinked> {
  @IsString()
  type = TakaroEvents.PLAYER_LINKED;
}

export class TakaroEventGameserverCreated extends BaseEvent<TakaroEventGameserverCreated> {
  @IsString()
  type = TakaroEvents.GAMESERVER_CREATED;
}

export class TakaroEventGameserverUpdated extends BaseEvent<TakaroEventGameserverUpdated> {
  @IsString()
  type = TakaroEvents.GAMESERVER_UPDATED;
}

export class TakaroEventGameserverDeleted extends BaseEvent<TakaroEventGameserverDeleted> {
  @IsString()
  type = TakaroEvents.GAMESERVER_DELETED;
}

export const TakaroEventsMapping = {
  [TakaroEvents.ROLE_ASSIGNED]: TakaroEventRoleAssigned,
  [TakaroEvents.PLAYER_NEW_IP_DETECTED]: TakaroEventPlayerNewIpDetected,
  [TakaroEvents.CURRENCY_DEDUCTED]: TakaroEventCurrencyDeducted,
  [TakaroEvents.CURRENCY_ADDED]: TakaroEventCurrencyAdded,
  [TakaroEvents.COMMAND_EXECUTED]: TakaroEventCommandExecuted,
  [TakaroEvents.ROLE_REMOVED]: TakaroEventRoleRemoved,
  [TakaroEvents.ROLE_CREATED]: TakaroEventRoleCreated,
  [TakaroEvents.ROLE_UPDATED]: TakaroEventRoleUpdated,
  [TakaroEvents.ROLE_DELETED]: TakaroEventRoleDeleted,
  [TakaroEvents.SETTINGS_SET]: TakaroEventSettingsSet,
  [TakaroEvents.HOOK_EXECUTED]: TakaroEventHookExecuted,
  [TakaroEvents.CRONJOB_EXECUTED]: TakaroEventCronjobExecuted,
  [TakaroEvents.SERVER_STATUS_CHANGED]: TakaroEventServerStatusChanged,
  [TakaroEvents.MODULE_CREATED]: TakaroEventModuleCreated,
  [TakaroEvents.MODULE_UPDATED]: TakaroEventModuleUpdated,
  [TakaroEvents.MODULE_DELETED]: TakaroEventModuleDeleted,
  [TakaroEvents.MODULE_INSTALLED]: TakaroEventModuleInstalled,
  [TakaroEvents.MODULE_UNINSTALLED]: TakaroEventModuleUninstalled,
  [TakaroEvents.PLAYER_CREATED]: TakaroEventPlayerCreated,
  [TakaroEvents.SHOP_LISTING_CREATED]: TakaroEventShopListingCreated,
  [TakaroEvents.SHOP_LISTING_UPDATED]: TakaroEventShopListingUpdated,
  [TakaroEvents.SHOP_LISTING_DELETED]: TakaroEventShopListingDeleted,
  [TakaroEvents.SHOP_ORDER_CREATED]: TakaroEventShopOrderCreated,
  [TakaroEvents.SHOP_ORDER_STATUS_CHANGED]: TakaroEventShopOrderStatusChanged,
  [TakaroEvents.SHOP_ORDER_DELIVERY_FAILED]: TakaroEventShopOrderDeliveryFailed,
  [TakaroEvents.PLAYER_LINKED]: TakaroEventPlayerLinked,
  [TakaroEvents.GAMESERVER_CREATED]: TakaroEventGameserverCreated,
  [TakaroEvents.GAMESERVER_UPDATED]: TakaroEventGameserverUpdated,
  [TakaroEvents.GAMESERVER_DELETED]: TakaroEventGameserverDeleted,
} as const;
