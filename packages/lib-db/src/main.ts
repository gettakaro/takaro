import { PrismaClient } from '@prisma/client';
import { logger } from '@takaro/logger';

export { ITakaroQuery, QueryBuilder, SortDirection } from './queryBuilder';
export { DANGEROUS_cleanDatabase } from './util';

const log = logger('db');

export const db = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
});

db.$on('query', (e) => {
  log.debug(`📖 [${e.duration} ms] ${e.query}`, {
    duration: e.duration,
    query: e.query,
  });
});

process.on('beforeExit', async () => {
  await db.$disconnect();
});
