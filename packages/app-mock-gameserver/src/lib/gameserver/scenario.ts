import { logger } from '@takaro/util';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import readline from 'node:readline/promises';
import { IPlayerReferenceDTO } from '@takaro/gameserver';

import { EventLogLine, GameEvents } from '@takaro/modules';
import { getMockServer } from './index.js';
import { MockServerSocketServer } from '../socket/socketTypes.js';

const log = logger('scenarioHandler');

let isScenarioPlaying = false;

interface IScenarioEvent {
  time: number;
  event: GameEvents;
  data: Record<string, unknown>;
}

export async function playScenario(socketServer: MockServerSocketServer) {
  if (isScenarioPlaying) {
    log.info('Scenario already playing, skipping');
    return;
  }

  const scenarios = await fs.readdir('./src/scenarios');
  const gameInstance = await getMockServer();

  const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  log.info(`Playing scenario ${randomScenario}`);

  isScenarioPlaying = true;

  // Read file line by line and log
  const fileStream = createReadStream(`./src/scenarios/${randomScenario}`);
  const rl = await readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const eventPromises: Promise<unknown>[] = [];

  for await (const line of rl) {
    const event = JSON.parse(line) as IScenarioEvent;

    const promise = new Promise<void>((resolve) => {
      setTimeout(async () => {
        try {
          const eventData = event.data;

          if (eventData.player) {
            eventData.player = await gameInstance.getPlayer({
              gameId: eventData.player,
            } as IPlayerReferenceDTO);
          }

          eventData.type = event.event;
          eventData.timestamp = new Date().toISOString();

          log.info(`Emitting event ${event.event} with data ${JSON.stringify(eventData)}`);
          socketServer.emit(event.event, eventData as unknown as EventLogLine);

          resolve();
        } catch (error) {
          resolve();
        }
      }, event.time);
    });

    eventPromises.push(promise);
  }

  try {
    await Promise.all(eventPromises);
  } catch (error) {
    log.warn('Error while playing scenario, ignoring and continuing', error);
  }
  isScenarioPlaying = false;
}
