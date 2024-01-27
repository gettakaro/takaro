import { DiscordEvents, DiscordEventsMapping } from './discordEvents.js';
import { GameEvents, GameEventsMapping } from './gameEvents.js';
import { TakaroEvents, TakaroEventsMapping } from './takaroEvents.js';
import { ValueOf } from 'type-fest';
import { BaseEvent } from './base.js';

export * from './discordEvents.js';
export * from './gameEvents.js';
export * from './takaroEvents.js';
export * from './base.js';

export const HookEvents = {
  ...GameEvents,
  ...DiscordEvents,
  ...TakaroEvents,
} as const;

export const EventMapping: Record<EventTypes, typeof BaseEvent<any>> = {
  ...GameEventsMapping,
  ...DiscordEventsMapping,
  ...TakaroEventsMapping,
} as const;

export type EventPayload = ValueOf<(typeof EventMapping)[ValueOf<typeof HookEvents>]>;
export type EventTypes = ValueOf<typeof HookEvents>;
