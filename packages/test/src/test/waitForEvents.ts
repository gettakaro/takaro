import { GameEvents } from '@takaro/gameserver';
import { Client } from '@takaro/apiclient';
import { io } from 'socket.io-client';
import { integrationConfig } from './integrationConfig.js';

export interface IDetectedEvent {
  event: GameEvents;
  data: any;
}

export async function waitForEvents(
  client: Client,
  expectedEvent: GameEvents,
  amount = 1
) {
  const events: IDetectedEvent[] = [];
  let hasFinished = false;
  return Promise.race([
    new Promise<IDetectedEvent[]>(async (resolve) => {
      const socket = io(integrationConfig.get('host'), {
        extraHeaders: {
          Authorization: `Bearer ${client.token}`,
        },
      });

      socket.on('gameEvent', (_gameserverId, event, data) => {
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
      }, 8000);
    }),
  ]);
}
