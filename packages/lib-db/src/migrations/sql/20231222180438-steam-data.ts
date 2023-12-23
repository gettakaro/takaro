import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('players', (table) => {
    table.string('steamAvatar').nullable();
    table.timestamp('steamLastFetch').nullable();
    table.timestamp('steamAccountCreated').nullable();
    table.boolean('steamCommunityBanned').nullable();
    table.string('steamEconomyBan').nullable();
    table.boolean('steamVacBanned').nullable();
    table.string('steamsDaysSinceLastBan').nullable();
    table.string('steamNumberOfVACBans').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('players', (table) => {
    table.dropColumn('steamAvatar');
    table.dropColumn('steamLastFetch');
    table.dropColumn('steamAccountCreated');
    table.dropColumn('steamCommunityBanned');
    table.dropColumn('steamEconomyBan');
    table.dropColumn('steamVacBanned');
    table.dropColumn('steamsDaysSinceLastBan');
    table.dropColumn('steamNumberOfVACBans');
  });
}
