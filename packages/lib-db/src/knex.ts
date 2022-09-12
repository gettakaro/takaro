import Knex, { Knex as IKnex } from 'knex';
import { config } from './config';
import { logger } from '@takaro/logger';

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

export function getDomainSchemaName(domainId: string) {
  return `${config.get('baseDomainSchema')}${domainId}`;
}

const knexCache = new Map();
let NON_DOMAIN_SCOPED_cachedKnex: IKnex | null = null;

export async function NOT_DOMAIN_SCOPED_getKnex(
  alternateSearchPath?: string
): Promise<IKnex> {
  if (NON_DOMAIN_SCOPED_cachedKnex) {
    return NON_DOMAIN_SCOPED_cachedKnex;
  }
  log.debug('Missed knex cache for unscoped, creating new client');

  const searchPath = alternateSearchPath ?? config.get('systemSchema');
  const knex = Knex(getKnexOptions({ searchPath }));
  await knex.raw('CREATE SCHEMA IF NOT EXISTS ?? AUTHORIZATION ??;', [
    config.get('systemSchema'),
    config.get('postgres.user'),
  ]);
  const final = addLoggingMiddle(knex);
  NON_DOMAIN_SCOPED_cachedKnex = final;
  return final;
}

export async function NOT_DOMAIN_SCOPED_disconnectKnex(): Promise<void> {
  if (!NON_DOMAIN_SCOPED_cachedKnex) return;
  await NON_DOMAIN_SCOPED_cachedKnex.destroy();
  NON_DOMAIN_SCOPED_cachedKnex = null;
  log.info('Disconnected non-domain scoped knex');
}

export async function getKnex(domainId: string): Promise<IKnex> {
  if (knexCache.has(domainId)) {
    return knexCache.get(domainId);
  }
  log.debug(`Missed knex cache for domain ${domainId}, creating new client`);
  const knex = Knex(
    getKnexOptions({ searchPath: getDomainSchemaName(domainId) })
  );
  await knex.raw('CREATE SCHEMA IF NOT EXISTS ?? AUTHORIZATION ??;', [
    getDomainSchemaName(domainId),
    config.get('postgres.user'),
  ]);
  const final = addLoggingMiddle(knex);
  knexCache.set(domainId, final);
  return final;
}

export async function disconnectKnex(domainId: string): Promise<void> {
  if (!knexCache.has(domainId)) return;
  await knexCache.get(domainId).destroy();
  knexCache.delete(domainId);
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
