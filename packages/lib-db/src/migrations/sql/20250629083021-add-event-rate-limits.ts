import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('domains', (table) => {
    table.integer('eventRateLimitLogLine').defaultTo(600);
    table.integer('eventRateLimitChatMessage').defaultTo(250);
    table.integer('eventRateLimitPlayerConnected').defaultTo(60);
    table.integer('eventRateLimitPlayerDisconnected').defaultTo(60);
    table.integer('eventRateLimitPlayerDeath').defaultTo(200);
    table.integer('eventRateLimitEntityKilled').defaultTo(200);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('domains', (table) => {
    table.dropColumn('eventRateLimitLogLine');
    table.dropColumn('eventRateLimitChatMessage');
    table.dropColumn('eventRateLimitPlayerConnected');
    table.dropColumn('eventRateLimitPlayerDisconnected');
    table.dropColumn('eventRateLimitPlayerDeath');
    table.dropColumn('eventRateLimitEntityKilled');
  });
}
