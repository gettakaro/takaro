import { db } from './main';

/**
 * Deletes all data from database
 * pls dont run this in production <.<
 */
export async function DANGEROUS_cleanDatabase() {
  if (process.env.NODE_ENV === 'production')
    throw new Error('Tried to delete all database data in production');
  const models = Object.keys(db).filter((key) => key[0] !== '_');

  const promises = models.map((name) => {
    // @ts-expect-error accessing Prisma internals here.. :/
    return db[name].deleteMany();
  });

  await Promise.all(promises);
}
