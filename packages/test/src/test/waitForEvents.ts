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
  private eventBuffer: any[] = [];
  private activeWaiters: Set<(event: any) => void> = new Set();

  async connect(client: Client) {
    return new Promise<EventsAwaiter>((resolve, reject) => {
      this.socket = io(integrationConfig.get('host'), {
        transports: ['websocket'],
        extraHeaders: {
          Authorization: `Bearer ${client.token}`,
        },
      });

      // Attach event listener immediately to capture all events from connection time
      // This prevents race conditions where events are emitted before waitForEvents() is called
      this.socket.on('event', (event) => {
        this.eventBuffer.push(event);

        // Notify all active waiters about the new event
        this.activeWaiters.forEach((waiter) => waiter(event));
      });

      // Wait for 'ready' event from server instead of just 'connect'
      // This ensures server-side socket.join() has completed with Redis adapter
      // before we proceed with test execution (fixes race condition)
      this.socket.on('ready', async () => {
        return resolve(this);
      });

      this.socket.on('connect_error', (err) => {
        return reject(err);
      });
    });
  }

  async disconnect() {
    this.activeWaiters.clear();
    this.socket.removeAllListeners();
    this.socket.disconnect();
  }

  async waitForEvents(expectedEvent: EventTypes | string, amount = 1) {
    if (!this.socket.connected) throw new Error('Socket not connected');
    const events: IDetectedEvent[] = [];
    let hasFinished = false;

    // First check buffer for events that already arrived
    const bufferedMatches = this.eventBuffer.filter((e) => e.eventName === expectedEvent);
    events.push(...bufferedMatches.map((data) => ({ event: data.eventName, data })));

    // If we already have enough events from buffer, return immediately
    if (events.length >= amount) {
      return events.slice(0, amount);
    }

    // Need to wait for more events
    return Promise.race([
      new Promise<IDetectedEvent[]>((resolve) => {
        const waiter = (event: any) => {
          if (event.eventName === expectedEvent) {
            events.push({ event: event.eventName, data: event });

            if (events.length >= amount) {
              hasFinished = true;
              this.activeWaiters.delete(waiter);
              // Don't auto-disconnect on success - allow EventsAwaiter reuse
              // Cleanup will be handled by test infrastructure teardown
              resolve(events.slice(0, amount));
            }
          }
        };

        // Register this waiter to be notified of new events
        this.activeWaiters.add(waiter);
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
