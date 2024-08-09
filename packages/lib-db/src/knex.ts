import knexPkg from 'knex';
import { config } from './config.js';
import { logger, health } from '@takaro/util';
import { TakaroModel } from './TakaroModel.js';

const log = logger('sql');

const { knex: createKnex } = knexPkg;

type KnexClient = knexPkg.Knex<TakaroModel, unknown[]>;

export function getKnexOptions(extra: Record<string, unknown> = {}) {
  const opts = {
    client: 'pg',
    connection: {
      host: config.get('postgres.host'),
      port: config.get('postgres.port'),
      user: config.get('postgres.user'),
      password: config.get('postgres.password'),
      database: config.get('postgres.database'),
      ssl: config.get('postgres.ssl'),
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

  health.registerHook('db', async () => {
    try {
      await knex.raw('SELECT 1');
      return true;
    } catch (error) {
      log.error(error);
      return false;
    }
  });

  return cachedKnex;
}

export async function disconnectKnex(): Promise<void> {
  if (!cachedKnex) return;
  await cachedKnex.destroy();
  cachedKnex = null;
  log.info('Disconnected knex');
}
