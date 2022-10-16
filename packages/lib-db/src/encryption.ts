import { Knex as IKnex } from 'knex';
import { config } from './config';

export async function encrypt(knex: IKnex, value: string): Promise<string> {
  const res = await knex.raw('SELECT PGP_SYM_ENCRYPT(?,?) AS value', [
    value,
    config.get('encryptionKey'),
  ]);
  return res.rows[0].value;
}

export async function decrypt(knex: IKnex, value: string): Promise<string> {
  const res = await knex.raw('SELECT PGP_SYM_DECRYPT(?,?) AS value', [
    value,
    config.get('encryptionKey'),
  ]);
  return res.rows[0].value;
}

export async function hash(knex: IKnex, value: string): Promise<string> {
  const res = await knex.raw("SELECT crypt(?, gen_salt('bf')) as value", [
    value,
  ]);
  return res.rows[0].value;
}

export async function compareHashed(
  knex: IKnex,
  value: string,
  hash: string
): Promise<boolean> {
  const res = await knex.raw('SELECT crypt(?, ?) = ? as result', [
    value,
    hash,
    hash,
  ]);
  return res.rows[0].result;
}
