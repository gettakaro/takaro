import 'reflect-metadata';
import { GameEvents } from '@takaro/modules';
import { Client } from '@takaro/apiclient';
import { io, Socket } from 'socket.io-client';
import { integrationConfig } from './integrationConfig.js';

export interface IDetectedEvent {
  event: GameEvents;
  data: any;
}

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

  async waitForEvents(expectedEvent: GameEvents | string, amount = 1) {
    const events: IDetectedEvent[] = [];
    let hasFinished = false;

    return Promise.race([
      new Promise<IDetectedEvent[]>(async (resolve) => {
        if (Object.values(GameEvents).includes(expectedEvent as GameEvents)) {
          this.socket.on('gameEvent', (_gameserverId, event, data) => {
            if (event !== expectedEvent) {
              // log.warn(`Received event ${event} but expected ${expectedEvent}`);
              //console.log(JSON.stringify({ event, data }, null, 2));
              return;
            }

            if (event === expectedEvent) {
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
          const msg = `Event ${expectedEvent} timed out - received ${events.length}/${amount} events`;
          console.warn(msg);
          console.warn(JSON.stringify(events, null, 2));
          reject(new Error(msg));
        }, 5000);
      }),
    ]);
  }
}
