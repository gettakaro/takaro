import knexPkg from 'knex';
import { config } from './config.js';
import { logger, health } from '@takaro/util';
import { TakaroModel } from './TakaroModel.js';

const log = logger('sql');

const { knex: createKnex } = knexPkg;

type KnexClient = knexPkg.Knex<TakaroModel, unknown[]>;

export function getKnexOptions(extra: Record<string, unknown> = {}) {
  const opts: knexPkg.Knex.Config = {
    client: 'pg',
    connection: {
      connectionString: config.get('postgres.connectionString'),
      host: config.get('postgres.host'),
      port: config.get('postgres.port'),
      user: config.get('postgres.user'),
      password: config.get('postgres.password'),
      database: config.get('postgres.database'),
      ssl: config.get('postgres.ssl') ? { ca: config.get('postgres.ca') } : false,
    },
    ...extra,
  };
  return opts;
}

let cachedKnex: KnexClient | null = null;

export async function getKnex(): Promise<KnexClient> {
  if (cachedKnex) return cachedKnex;

  log.debug('Missed knex cache, creating new client');
  const knex = createKnex(getKnexOptions());
  cachedKnex = knex;

  health.registerHook('db', isDbAvailable);

  return cachedKnex;
}

export async function isDbAvailable(): Promise<boolean> {
  try {
    const knex = await getKnex();
    await knex.raw('SELECT 1');
    return true;
  } catch (error) {
    log.error(error);
    return false;
  }
}

export async function disconnectKnex(): Promise<void> {
  if (!cachedKnex) return;
  await cachedKnex.destroy();
  cachedKnex = null;
  log.info('Disconnected knex');
}
