import 'reflect-metadata';

import { logger } from '@takaro/shared';
import { Connection, ConnectionOptions, createConnection } from 'typeorm';

import { config } from '../config';

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
    ssl: config.database.ssl, // if not development, will use SSL
    extra: {}
  };
  
  const connection = await createConnection(connectionOptions);
  log.info('Connected to database');

  return connection;
}