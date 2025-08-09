import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('playerInventoryHistory', (table) => {
    table.string('quality').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('playerInventoryHistory', (table) => {
    table.dropColumn('quality');
  });
}
