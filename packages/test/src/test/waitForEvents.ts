import 'reflect-metadata';
import { EventTypes, GameEvents } from '@takaro/modules';
import { Client } from '@takaro/apiclient';
import { io, Socket } from 'socket.io-client';
import { integrationConfig } from './integrationConfig.js';
import { ValueOf } from 'type-fest';

export interface IDetectedEvent {
  event: EventTypes;
  data: any;
}

interface IExtraFilters {
  gameServerId?: string;
}

export const sorter = (a: IDetectedEvent, b: IDetectedEvent) => {
  if (a.data.timestamp < b.data.timestamp) {
    return -1;
  }
  if (a.data.timestamp > b.data.timestamp) {
    return 1;
  }
  return 0;
};

export class EventsAwaiter {
  socket: Socket;

  async connect(client: Client) {
    return new Promise<void>((resolve, reject) => {
      this.socket = io(integrationConfig.get('host'), {
        extraHeaders: {
          Authorization: `Bearer ${client.token}`,
        },
      });

      this.socket.on('connect', async () => {
        return resolve();
      });

      this.socket.on('connect_error', (err) => {
        return reject(err);
      });
    });
  }

  async waitForEvents(expectedEvent: EventTypes | string, amount = 1, extraFilters: Partial<IExtraFilters> = {}) {
    const events: IDetectedEvent[] = [];
    const discardedEvents: IDetectedEvent[] = [];
    let hasFinished = false;

    return Promise.race([
      new Promise<IDetectedEvent[]>((resolve) => {
        if (Object.values(GameEvents).includes(expectedEvent as ValueOf<typeof GameEvents>)) {
          this.socket.on('gameEvent', (_gameserverId, event, data) => {
            if (event !== expectedEvent) {
              // log.warn(`Received event ${event} but expected ${expectedEvent}`);
              //console.log(JSON.stringify({ event, data }, null, 2));
              discardedEvents.push({ event, data });
              return;
            }

            if (event === expectedEvent) {
              if (extraFilters.gameServerId && extraFilters.gameServerId !== _gameserverId) {
                return;
              }
              events.push({ event, data });
            }

            if (events.length === amount) {
              hasFinished = true;
              resolve(events);
            }
          });
        } else {
          this.socket.on('event', (event) => {
            if (event.eventName === expectedEvent) {
              events.push({ event, data: event });
            } else {
              discardedEvents.push({ event, data: event });
            }

            if (events.length === amount) {
              hasFinished = true;
              resolve(events);
            }
          });
        }
      }),
      new Promise<IDetectedEvent[]>((_, reject) => {
        setTimeout(() => {
          if (hasFinished) return;
          const msg = `Event ${expectedEvent} timed out - received ${events.length}/${amount} events.`;
          console.warn(msg);
          reject(new Error(msg));
        }, integrationConfig.get('waitForEventsTimeout'));
      }),
    ]);
  }
}
