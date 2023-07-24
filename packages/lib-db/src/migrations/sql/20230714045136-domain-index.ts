import { Knex } from 'knex';

const tablesToIndex = [
  'roles',
  'gameservers',
  'players',
  'playerOnGameServer',
  'functions',
  'settings',
  'gameServerSettings',
  'cronJobs',
  'hooks',
  'commands',
  'commandArguments',
  'modules',
  'moduleAssignments',
  'variables',
  'users',
  'discordGuilds',
  'userOnDiscordGuild',
  'events',
];

export async function up(knex: Knex): Promise<void> {
  // Add index for domain in all tables
  for (const table of tablesToIndex) {
    await knex.schema.alterTable(table, (t) => {
      t.index('domain');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  // Remove index for domain in all tables
  for (const table of tablesToIndex) {
    await knex.schema.alterTable(table, (t) => {
      t.dropIndex('domain');
    });
  }
}
