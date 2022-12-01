import Knex, { Knex as IKnex } from 'knex';
import { config } from './config';
import { logger } from '@takaro/util';

const log = logger('sql');

export function getKnexOptions(extra: Record<string, unknown> = {}) {
  const opts = {
    client: 'pg',
    connection: {
      host: config.get('postgres.host'),
      port: config.get('postgres.port'),
      user: config.get('postgres.user'),
      password: config.get('postgres.password'),
      database: config.get('postgres.database'),
    },
    ...extra,
  };
  return opts;
}

let cachedKnex: IKnex | null = null;

export async function getKnex(): Promise<IKnex> {
  if (cachedKnex) return cachedKnex;

  log.debug('Missed knex cache, creating new client');
  const knex = Knex(getKnexOptions());
  const final = addLoggingMiddle(knex);
  cachedKnex = final;
  return final;
}

export async function disconnectKnex(domainId: string): Promise<void> {
  if (!cachedKnex) return;
  await cachedKnex.destroy();
  cachedKnex = null;
  log.info(`Disconnected knex for domain ${domainId}`);
}

function addLoggingMiddle(knex: IKnex) {
  if (config.get('mode') === 'development') {
    knex.on('query', (queryData) => {
      log.debug(queryData.sql, { data: queryData.bindings });
    });
  } else {
    knex.on('query', (queryData) => {
      log.debug(queryData.sql);
    });
  }

  return knex;
}
