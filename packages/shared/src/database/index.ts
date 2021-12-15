import 'reflect-metadata';

import { Connection, ConnectionOptions, createConnection } from 'typeorm';

import { config } from '../util/config';
import { logger } from '../util/logger';

export { Player } from './entity/player.entity';
export { GameServer, GameServerTypes } from './entity/gameServer.entity';
export { User } from './entity/user.entity';

/**
 * With the reflect-metadata package you can do runtime reflection on types.
 * Since TypeORM mostly works with decorators (like @Entity or @Column),
 * this package is used to parse these decorators and use it for building sql queries.
 */
const log = logger('db');

export async function getDatabase(): Promise<Connection> {
  const connectionOptions: ConnectionOptions = {
    type: 'postgres',
    url: config.database.url,
    synchronize: true,
    logging: false,
    entities: config.database.entitiesPath,
    extra: {},
  };

  const connection = await createConnection(connectionOptions);
  log.info('Connected to database');

  return connection;
}
