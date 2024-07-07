import { logger } from '@takaro/util';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import readline from 'node:readline/promises';
import { IPlayerReferenceDTO } from '@takaro/gameserver';

import { GameEventTypes } from '@takaro/modules';
import { MockGameserver } from './index.js';
import { MockServerSocketServer } from '../socket/socketTypes.js';

const log = logger('scenarioHandler');

const __dirname = path.resolve(path.dirname(''));

interface IScenarioEvent {
  time: number;
  event: GameEventTypes;
  data: Record<string, unknown>;
}

export async function playScenario(socketServer: MockServerSocketServer, gameInstance: MockGameserver) {
  const scenarios = await fs.readdir(path.join(__dirname, './src/scenarios'));

  const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  log.info(`Playing scenario ${randomScenario}`);

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
            eventData.player = await gameInstance.getPlayer(
              {
                gameId: eventData.player,
              } as IPlayerReferenceDTO,
              false
            );
          }

          eventData.type = event.event;
          eventData.timestamp = new Date().toISOString();

          log.info(`Emitting event ${event.event} with data ${JSON.stringify(eventData)}`);

          if (event.event === 'player-connected') {
            await gameInstance.setPlayerOnlineStatus(event.data.player as IPlayerReferenceDTO, true);
          } else if (event.event === 'player-disconnected') {
            await gameInstance.setPlayerOnlineStatus(event.data.player as IPlayerReferenceDTO, false);
          } else {
            gameInstance.emitEvent(event.event, eventData);
          }

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
}
