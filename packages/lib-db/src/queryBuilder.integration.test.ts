import {
  NOT_DOMAIN_SCOPED_getKnex,
  NOT_DOMAIN_SCOPED_disconnectKnex,
} from './knex';
import { QueryBuilder } from './queryBuilder';
import { expect } from '@takaro/test';

const TEST_TABLE_NAME = 'test_users';

describe('QueryBuilder', () => {
  beforeEach(async () => {
    const knex = await NOT_DOMAIN_SCOPED_getKnex();
    await knex.schema.dropTableIfExists(TEST_TABLE_NAME);
    await knex.schema.createTable(TEST_TABLE_NAME, (table) => {
      table.timestamps(true, true, true);
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
      table.string('name');
      table.string('email');
      table.string('password');
    });
  });

  afterEach(async () => {
    const knex = await NOT_DOMAIN_SCOPED_getKnex();
    await knex.schema.dropTableIfExists(TEST_TABLE_NAME);
    await NOT_DOMAIN_SCOPED_disconnectKnex();
  });

  it('Can create basic filters', async () => {
    const knex = await NOT_DOMAIN_SCOPED_getKnex();

    await knex
      .insert({ name: 'joske', email: 'joske@gmail.com', password: 'secret' })
      .into(TEST_TABLE_NAME);
    await knex
      .insert({ name: 'jefke', email: 'jefke@gmail.com', password: 'secret' })
      .into(TEST_TABLE_NAME);

    const params = new QueryBuilder({ filters: { name: 'jefke' } }).build();
    const res = await knex.select().from(TEST_TABLE_NAME).where(params.where);

    expect(res).to.have.lengthOf(1);
    expect(res[0].name).to.equal('jefke');
  });
});
