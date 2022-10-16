import { compareHashed, decrypt, encrypt, hash } from './encryption';
import { NOT_DOMAIN_SCOPED_getKnex } from './knex';
import { expect } from '@takaro/test';

describe('Database encryption', () => {
  describe('Encryption', () => {
    it('Can encrypt a simple string', async () => {
      const knex = await NOT_DOMAIN_SCOPED_getKnex();
      const encrypted = await encrypt(knex, 'test');
      expect(encrypted).to.not.eq('test');
    });

    it('Can decrypt a simple string', async () => {
      const knex = await NOT_DOMAIN_SCOPED_getKnex();
      const encrypted = await encrypt(knex, 'test');
      const decrypted = await decrypt(knex, encrypted);
      expect(decrypted).to.eq('test');
    });

    it('Can handle complex JSON structures', async () => {
      const knex = await NOT_DOMAIN_SCOPED_getKnex();
      const encrypted = await encrypt(knex, JSON.stringify({ foo: 'bar' }));
      const decrypted = await decrypt(knex, encrypted);
      expect(decrypted).to.eq(JSON.stringify({ foo: 'bar' }));
    });

    it('Can handle very long values', async () => {
      const knex = await NOT_DOMAIN_SCOPED_getKnex();
      const longValue = 'a'.repeat(1000000);
      const encrypted = await encrypt(knex, longValue);
      const decrypted = await decrypt(knex, encrypted);
      expect(decrypted).to.eq(longValue);
    });
  });

  describe('Hashing', async () => {
    it('Can hash a simple string', async () => {
      const knex = await NOT_DOMAIN_SCOPED_getKnex();
      const hashed = await hash(knex, 'test');
      expect(hashed).to.not.eq('test');
      expect(hashed).to.match(/^\$2a\$06\$/);
    });

    it('Can compare a simple string', async () => {
      const knex = await NOT_DOMAIN_SCOPED_getKnex();
      const hashed = await hash(knex, 'test');
      const result = await compareHashed(knex, 'test', hashed);
      expect(result).to.eq(true);
    });

    it('Returns false when comparing different strings', async () => {
      const knex = await NOT_DOMAIN_SCOPED_getKnex();
      const hashed = await hash(knex, 'test');
      const result = await compareHashed(knex, 'test2', hashed);
      expect(result).to.eq(false);
    });
  });
});
