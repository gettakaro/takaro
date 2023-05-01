import { ModuleOutputDTO, GameServerOutputDTO } from '@takaro/apiclient';
import { logger } from '@takaro/util';
import { integrationConfig, IntegrationTest } from '@takaro/test';
import { GameEvents } from '@takaro/gameserver';
import { io, Socket } from 'socket.io-client';

const log = logger('modules:test');

export interface IDetectedEvent {
  event: GameEvents;
  data: any;
}

export interface IModuleTestsSetupData {
  modules: ModuleOutputDTO[];
  gameserver: GameServerOutputDTO;
  utilsModule: ModuleOutputDTO;
  teleportsModule: ModuleOutputDTO;
  socket: Socket;
  waitForEvent: (
    event: GameEvents,
    amount?: number
  ) => Promise<IDetectedEvent[]>;
  collectEvents: (timeout?: number) => Promise<IDetectedEvent[]>;
}

export const modulesTestSetup = async function (
  this: IntegrationTest<IModuleTestsSetupData>
): Promise<IModuleTestsSetupData> {
  const token = await this.client.login();

  const socket = io(integrationConfig.get('host'), {
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  const timeout = 5000;
  const connectedSocket = await Promise.race([
    new Promise<Socket>((resolve, reject) => {
      socket.on('connect', () => {
        resolve(socket);
      });
      socket.on('connect_error', (err) => {
        reject(err);
      });
    }),
    new Promise<Socket>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Connection timed out after ${timeout}ms`));
      }, timeout);
    }),
  ]);

  const modules = (await this.client.module.moduleControllerSearch()).data.data;

  const gameserver = await this.client.gameserver.gameServerControllerCreate({
    connectionInfo: JSON.stringify({
      host: integrationConfig.get('mockGameserver.host'),
    }),
    type: 'MOCK',
    name: 'Test gameserver',
  });

  const teleportsModule = modules.find((m) => m.name === 'teleports');
  if (!teleportsModule) throw new Error('teleports module not found');

  const utilsModule = modules.find((m) => m.name === 'utils');
  if (!utilsModule) throw new Error('utils module not found');

  async function waitForEvent(
    expectedEvent: GameEvents,
    amount = 1
  ): Promise<IDetectedEvent[]> {
    const events: IDetectedEvent[] = [];

    return await Promise.race([
      new Promise<IDetectedEvent[]>((resolve) => {
        connectedSocket.on('gameEvent', (gameserverId, event, data) => {
          if (gameserverId !== gameserver.data.data.id) {
            log.warn(
              `Received event for gameserver ${gameserverId} but expected ${gameserver.data.data.id}`
            );
            return;
          }

          if (event !== expectedEvent) {
            // log.warn(`Received event ${event} but expected ${expectedEvent}`);
            // log.warn(JSON.stringify({ event, data }, null, 2));
            return;
          }

          if (event === expectedEvent) {
            events.push({ event, data });
          }

          if (events.length === amount) {
            resolve(events);
          }
        });
      }),
      new Promise<IDetectedEvent[]>((resolve) => {
        setTimeout(() => {
          resolve(events);
        }, 3000);
      }),
    ]);
  }

  async function collectEvents(timeout = 3000) {
    const events: IDetectedEvent[] = [];

    connectedSocket.on('gameEvent', (gameserverId, event, data) => {
      if (gameserverId !== gameserver.data.data.id) {
        log.warn(
          `Received event for gameserver ${gameserverId} but expected ${gameserver.data.data.id}`
        );
        return;
      }

      events.push({ event, data });
    });

    return new Promise<IDetectedEvent[]>((resolve) => {
      setTimeout(() => {
        resolve(events);
      }, timeout);
    });
  }

  return {
    modules: modules,
    utilsModule,
    teleportsModule,
    gameserver: gameserver.data.data,
    socket: await connectedSocket,
    waitForEvent,
    collectEvents,
  };
};
