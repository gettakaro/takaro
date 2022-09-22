/* eslint-disable @typescript-eslint/ban-types */
import { JsonObject } from 'type-fest';
import {
  GameEvents,
  EventLogLine,
  EventPlayerConnected,
  EventPlayerDisconnected,
  EventPlayerKicked,
  EventPlayerSpawned,
  EventPlayerMessaged,
} from './events';

export interface IEventMap {
  [GameEvents.LOG_LINE]: (log: EventLogLine) => Promise<void>;
  [GameEvents.PLAYER_CONNECTED]: (
    player: EventPlayerConnected
  ) => Promise<void>;
  [GameEvents.PLAYER_DISCONNECTED]: (
    player: EventPlayerDisconnected
  ) => Promise<void>;
  [GameEvents.PLAYER_KICKED]: (player: EventPlayerKicked) => Promise<void>;
  [GameEvents.PLAYER_SPAWNED]: (player: EventPlayerSpawned) => Promise<void>;
  [GameEvents.PLAYER_MESSAGED]: (player: EventPlayerMessaged) => Promise<void>;
  // TODO: not sure if this abstracts to 7d2d [GameEvents.ITEM_GIVEN_TO]: ...
}

export interface IGameEventEmitter {
  stop(): Promise<void>;
  start(config: JsonObject): Promise<void>;

  addListener<E extends keyof IEventMap>(
    event: E,
    listener: IEventMap[E]
  ): this;
  on<E extends keyof IEventMap>(event: E, listener: IEventMap[E]): this;
  once<E extends keyof IEventMap>(event: E, listener: IEventMap[E]): this;
  prependListener<E extends keyof IEventMap>(
    event: E,
    listener: IEventMap[E]
  ): this;
  prependOnceListener<E extends keyof IEventMap>(
    event: E,
    listener: IEventMap[E]
  ): this;

  off<E extends keyof IEventMap>(event: E, listener: IEventMap[E]): this;
  removeAllListeners<E extends keyof IEventMap>(event?: E): this;
  removeListener<E extends keyof IEventMap>(
    event: E,
    listener: IEventMap[E]
  ): this;

  emit<E extends keyof IEventMap>(
    event: E,
    ...args: Parameters<IEventMap[E]>
  ): boolean;

  eventNames(): (keyof IEventMap | string | symbol)[];
  rawListeners<E extends keyof IEventMap>(event: E): Function[];
  listeners<E extends keyof IEventMap>(event: E): Function[];
  listenerCount<E extends keyof IEventMap>(event: E): number;
  executeRawCommand(command: string): string;
  getMaxListeners(): number;
  setMaxListeners(maxListeners: number): this;
}
