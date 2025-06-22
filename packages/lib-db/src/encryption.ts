import { config } from './config.js';
import { getKnex } from './knex.js';

export async function encrypt(value: string): Promise<string> {
  const knex = await getKnex();
  const res = await knex.raw('SELECT PGP_SYM_ENCRYPT(?,?) AS value', [value, config.get('encryptionKey')]);
  return res.rows[0].value;
}

export async function decrypt(value: string): Promise<string> {
  const knex = await getKnex();
  const res = await knex.raw('SELECT PGP_SYM_DECRYPT(?,?) AS value', [value, config.get('encryptionKey')]);
  return res.rows[0].value;
}

export async function hash(value: string): Promise<string> {
  const knex = await getKnex();
  const res = await knex.raw("SELECT crypt(?, gen_salt('bf')) as value", [value]);
  return res.rows[0].value;
}

export async function compareHashed(value: string, hash: string): Promise<boolean> {
  const knex = await getKnex();
  const res = await knex.raw('SELECT crypt(?, ?) = ? as result', [value, hash, hash]);
  return res.rows[0].result;
}
