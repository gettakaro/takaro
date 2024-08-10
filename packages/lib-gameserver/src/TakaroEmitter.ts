import {
  BaseEvent,
  EventChatMessage,
  EventEntityKilled,
  EventLogLine,
  EventPlayerConnected,
  EventPlayerDeath,
  EventPlayerDisconnected,
  GameEvents,
} from '@takaro/modules';
import { errors, isTakaroDTO, logger } from '@takaro/util';
import { isPromise } from 'util/types';

const log = logger('TakaroEmitter');

/**
 * Maps event types to their listener function signatures
 * This allows our EventEmitter to be strongly typed
 */
export interface IEventMap {
  [GameEvents.LOG_LINE]: (log: EventLogLine) => Promise<void>;
  [GameEvents.PLAYER_CONNECTED]: (player: EventPlayerConnected) => Promise<void>;
  [GameEvents.PLAYER_DISCONNECTED]: (player: EventPlayerDisconnected) => Promise<void>;
  [GameEvents.CHAT_MESSAGE]: (chatMessage: EventChatMessage) => Promise<void>;
  [GameEvents.PLAYER_DEATH]: (playerDeath: EventPlayerDeath) => Promise<void>;
  [GameEvents.ENTITY_KILLED]: (entityKilled: EventEntityKilled) => Promise<void>;
  error: (error: errors.TakaroError | Error) => Promise<void> | void;
}

export abstract class TakaroEmitter {
  private listenerMap: Map<keyof IEventMap, IEventMap[keyof IEventMap][]> = new Map();

  abstract stop(): Promise<void>;
  abstract start(): Promise<void>;

  constructor() {
    return getErrorProxyHandler(this);
  }

  async emit<E extends keyof IEventMap>(event: E, data: BaseEvent<unknown> | Error) {
    try {
      // No listeners are attached, return early
      if (!this.listenerMap.has(event)) return;

      // Validate the data, it is user-input after all :)
      if (isTakaroDTO(data)) {
        if (!data.timestamp) data.timestamp = new Date().toISOString();
        // await data.validate();
      }

      const listeners = this.listenerMap.get(event);

      if (listeners) {
        for (const listener of listeners) {
          // We know this is okay because our listener map always corresponds to the right event
          // This is implicit in our implementation and checked in the tests
          // @ts-expect-error Can't get the types quite right :(
          await listener(data);
        }
      }
    } catch (error) {
      this.emit('error', error as Error);
    }
  }

  on<E extends keyof IEventMap>(event: E, listener: IEventMap[E]): this {
    this.listenerMap.set(event, [listener]);
    return this;
  }

  off<E extends keyof IEventMap>(event: E, listener: IEventMap[E]): this {
    const listeners = this.listenerMap.get(event);

    if (listeners) {
      this.listenerMap.set(
        event,
        listeners.filter((l) => l !== listener),
      );
    }

    return this;
  }

  hasErrorListener() {
    return this.listenerMap.has('error');
  }
}

export function getErrorProxyHandler<T extends TakaroEmitter>(emitter: T) {
  const errorProxyHandler: ProxyHandler<T> = {
    construct(target: any, argArray) {
      return Reflect.construct(target, argArray, TakaroEmitter);
    },

    set: function (obj, prop: keyof TakaroEmitter, value) {
      obj[prop] = value;
      return true;
    },

    get(target, prop: keyof TakaroEmitter) {
      return async (...[one, two]: any[]) => {
        try {
          // Check if callable function
          if (typeof target[prop] === 'function') {
            return await target[prop](one, two);
            // Or if its a Promise, await it
          } else if (isPromise(target[prop])) {
            return target[prop];
          }
          // Otherwise, return the value
          return target[prop];
        } catch (error) {
          if (!target.hasErrorListener()) {
            log.error('Unhandled error', error);
            const err = new Error(
              'Unhandled error in TakaroEmitter, attach a listener to the "error" event to handle this',
            );
            Error.captureStackTrace(err);
            throw err;
          }

          if (error instanceof errors.TakaroError) {
            await target.emit('error', error);
          } else if (error instanceof Error) {
            await target.emit('error', error);
          }

          if (!Object.prototype.hasOwnProperty.call(TakaroEmitter.prototype, prop)) {
            return Promise.reject(error);
          }
        }
      };
    },
  };

  return new Proxy(emitter, errorProxyHandler);
}
