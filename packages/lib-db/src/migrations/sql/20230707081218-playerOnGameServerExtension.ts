import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.integer('positionX').nullable();
    table.integer('positionY').nullable();
    table.integer('positionZ').nullable();
    table.integer('ping').nullable();
    table.specificType('ip', 'inet').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.dropColumn('positionX');
    table.dropColumn('positionY');
    table.dropColumn('positionZ');
    table.dropColumn('ping');
    table.dropColumn('ip');
  });
}
