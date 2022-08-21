import { db } from './main';

/**
 * Deletes all data from database
 * pls dont run this in production <.<
 */
export async function DANGEROUS_cleanDatabase() {
  if (process.env.NODE_ENV === 'production')
    throw new Error('Tried to delete all database data in production');

  await db.domain.deleteMany();
}
