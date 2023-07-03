import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('discordGuilds', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('domain').references('domains.id').onDelete('CASCADE').notNullable();

    table.string('discordId').notNullable();
    table.string('name').notNullable();
    table.string('icon');
    table.boolean('takaroEnabled').defaultTo(false);

    table.unique(['discordId', 'domain']);
  });

  await knex.schema.createTable('userOnDiscordGuild', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.uuid('userId').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('discordGuildId').references('id').inTable('discordGuilds').onDelete('CASCADE');

    table.string('domain').references('domains.id').onDelete('CASCADE').notNullable();

    table.unique(['userId', 'discordGuildId']);

    table.boolean('hasManageServer').defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('userOnDiscordGuild');
  await knex.schema.dropTable('discordGuilds');
}
