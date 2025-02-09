import { compareHashed, decrypt, encrypt, hash } from '../encryption.js';
import { expect } from '@takaro/test';
import { getKnex } from '../knex.js';
import { describe, before, it } from 'node:test';

describe('Database encryption', () => {
  before(async () => {
    const knex = await getKnex();
    await knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
  });

  describe('Encryption', () => {
    it('Can encrypt a simple string', async () => {
      const encrypted = await encrypt('test');
      expect(encrypted).to.not.eq('test');
    });

    it('Can decrypt a simple string', async () => {
      const encrypted = await encrypt('test');
      const decrypted = await decrypt(encrypted);
      expect(decrypted).to.eq('test');
    });

    it('Can handle complex JSON structures', async () => {
      const encrypted = await encrypt(JSON.stringify({ foo: 'bar' }));
      const decrypted = await decrypt(encrypted);
      expect(decrypted).to.eq(JSON.stringify({ foo: 'bar' }));
    });

    it('Can handle very long values', async () => {
      const longValue = 'a'.repeat(10000);
      const encrypted = await encrypt(longValue);
      const decrypted = await decrypt(encrypted);
      expect(decrypted).to.eq(longValue);
    });
  });

  describe('Hashing', async () => {
    it('Can hash a simple string', async () => {
      const hashed = await hash('test');
      expect(hashed).to.not.eq('test');
      expect(hashed).to.match(/^\$2a\$06\$/);
    });

    it('Can compare a simple string', async () => {
      const hashed = await hash('test');
      const result = await compareHashed('test', hashed);
      expect(result).to.eq(true);
    });

    it('Returns false when comparing different strings', async () => {
      const hashed = await hash('test');
      const result = await compareHashed('test2', hashed);
      expect(result).to.eq(false);
    });
  });
});
