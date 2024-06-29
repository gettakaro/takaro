import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Remove users_idp_id_unique constraint
  //idpId must be unique per domain instead
  await knex.schema.alterTable('users', (table) => {
    table.dropUnique(['idpid']);
    table.unique(['idpId', 'domain']);

    table.uuid('playerId').references('players.id').onDelete('SET NULL').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropUnique(['idpid', 'domain']);
    table.unique(['idpId']);
    table.dropColumn('playerId');
  });
}
