import { GameEvents } from '@takaro/modules';
import { Client } from '@takaro/apiclient';
import { io, Socket } from 'socket.io-client';
import { integrationConfig } from './integrationConfig.js';
import { sleep } from '@takaro/util';

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
        // There's a race condition happening somewhere with the io connection
        // I couldn't get to the bottom of it, so I'm just adding a sleep here for now...
        await sleep(500);
        return resolve();
      });

      this.socket.on('connect_error', (err) => {
        return reject(err);
      });
    });
  }

  async waitForEvents(expectedEvent: GameEvents, amount = 1) {
    const events: IDetectedEvent[] = [];
    let hasFinished = false;

    return Promise.race([
      new Promise<IDetectedEvent[]>(async (resolve) => {
        this.socket.on('gameEvent', (_gameserverId, event, data) => {
          if (event !== expectedEvent) {
            // log.warn(`Received event ${event} but expected ${expectedEvent}`);
            // log.warn(JSON.stringify({ event, data }, null, 2));
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
      }),
      new Promise<IDetectedEvent[]>((_, reject) => {
        setTimeout(() => {
          if (hasFinished) return;
          console.warn(`Event ${expectedEvent} timed out`);
          console.warn(JSON.stringify(events, null, 2));
          reject(new Error(`Event ${expectedEvent} timed out`));
        }, 15000);
      }),
    ]);
  }
}
