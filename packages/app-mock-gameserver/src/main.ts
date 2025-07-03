import 'reflect-metadata';
import { logger } from '@takaro/util';
import { GameServer } from './lib/ws-gameserver/gameserver.js';
import { IMockServerConfig } from './config.js';
import { PartialDeep } from 'type-fest/index.js';

const log = logger('agent');

export async function getMockServer(configOverrides: PartialDeep<IMockServerConfig> = {}): Promise<GameServer> {
  const gameserver = new GameServer(configOverrides);
  await gameserver.init();
  log.info('🚀 Mock Server started');

  return gameserver;
}
