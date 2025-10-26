import 'reflect-metadata';
import type { EventTypes } from '@takaro/modules';
import { Client } from '@takaro/apiclient';
import { io, Socket } from 'socket.io-client';
import { integrationConfig } from './integrationConfig.js';

export interface IDetectedEvent {
  event: EventTypes;
  data: any;
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
    return new Promise<EventsAwaiter>((resolve, reject) => {
      this.socket = io(integrationConfig.get('host'), {
        withCredentials: true,
        extraHeaders: {
          Authorization: `Bearer ${client.token}`,
        },
      });

      this.socket.on('connect', async () => {
        return resolve(this);
      });

      this.socket.on('connect_error', (err) => {
        return reject(err);
      });
    });
  }

  async disconnect() {
    this.socket.removeAllListeners();
    this.socket.disconnect();
  }

  async waitForEvents(expectedEvent: EventTypes | string, amount = 1) {
    if (!this.socket.connected) throw new Error('Socket not connected');
    const events: IDetectedEvent[] = [];
    const discardedEvents: IDetectedEvent[] = [];
    let hasFinished = false;

    return Promise.race([
      new Promise<IDetectedEvent[]>((resolve) => {
        this.socket.on('event', (event) => {
          if (event.eventName === expectedEvent) {
            events.push({ event, data: event });
          } else {
            discardedEvents.push({ event, data: event });
          }

          if (events.length === amount) {
            hasFinished = true;
            this.disconnect();
            resolve(events);
          }
        });
      }),
      new Promise<IDetectedEvent[]>((_, reject) => {
        setTimeout(() => {
          if (hasFinished) return;
          const msg = `Event ${expectedEvent} timed out - received ${events.length}/${amount} events.`;
          console.warn(msg);
          this.disconnect();
          reject(new Error(msg));
        }, integrationConfig.get('waitForEventsTimeout'));
      }),
    ]);
  }
}
