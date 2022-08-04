/* eslint-disable @typescript-eslint/ban-types */
import {
  GameEvents,
  IEventLogLine,
  IEventPlayerConnected,
  IEventPlayerDisconnected,
} from './events';

export interface IEventMap {
  [GameEvents.LOG_LINE]: (log: IEventLogLine) => Promise<void>;
  [GameEvents.PLAYER_CONNECTED]: (
    player: IEventPlayerConnected
  ) => Promise<void>;
  [GameEvents.PLAYER_DISCONNECTED]: (
    player: IEventPlayerDisconnected
  ) => Promise<void>;
}

export interface IGameEventEmitter {
  stop(): Promise<void>;
  start(): Promise<void>;

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

  getMaxListeners(): number;
  setMaxListeners(maxListeners: number): this;
}
