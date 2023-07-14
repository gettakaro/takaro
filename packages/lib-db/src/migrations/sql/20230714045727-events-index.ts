import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('events', (t) => {
    t.index('createdAt');
    t.index('playerId');
    t.index('gameserverId');
    t.index('moduleId');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('events', (t) => {
    t.dropIndex('createdAt');
    t.dropIndex('playerId');
    t.dropIndex('gameserverId');
    t.dropIndex('moduleId');
  });
}
