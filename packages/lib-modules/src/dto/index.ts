import { DiscordEvents, HookEventDiscordMessage } from './discordEvents.js';
import {
  EventChatMessage,
  EventEntityKilled,
  EventLogLine,
  EventPlayerConnected,
  EventPlayerDeath,
  EventPlayerDisconnected,
  GameEvents,
} from './gameEvents.js';

export * from './discordEvents.js';
export * from './gameEvents.js';

export type EventMapping = {
  [GameEvents.LOG_LINE]: EventLogLine;
  [GameEvents.PLAYER_CONNECTED]: EventPlayerConnected;
  [GameEvents.PLAYER_DISCONNECTED]: EventPlayerDisconnected;
  [GameEvents.CHAT_MESSAGE]: EventChatMessage;
  [GameEvents.PLAYER_DEATH]: EventPlayerDeath;
  [GameEvents.ENTITY_KILLED]: EventEntityKilled;
  [DiscordEvents.DISCORD_MESSAGE]: HookEventDiscordMessage;
};

export const EventTypes = { ...GameEvents, ...DiscordEvents };

export type HookEvents = keyof EventMapping;
export type HookEventTypes = EventMapping[HookEvents]['type'];
