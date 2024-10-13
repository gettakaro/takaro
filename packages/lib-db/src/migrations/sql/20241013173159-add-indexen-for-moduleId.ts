import { Knex } from 'knex';

// This follows some research done with https://github.com/ankane/pghero

export async function up(knex: Knex): Promise<void> {
  // Remove duplicate indexes
  await knex.schema.alterTable('events', (table) => {
    table.dropIndex('domain', 'events_domain_index');
  });
  await knex.schema.alterTable('items', (table) => {
    table.dropIndex('code', 'items_code_index');
  });
  await knex.schema.alterTable('players', (table) => {
    table.dropIndex('domain', 'players_domain_index');
  });

  // Add indexes
  await knex.schema.alterTable('commands', (table) => {
    table.index('moduleId');
  });
  await knex.schema.alterTable('events', (table) => {
    table.index(['domain', 'createdAt']);
  });
  await knex.schema.alterTable('functions', (table) => {
    table.index('moduleId');
  });
  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.index(['gameServerId', 'domain']);
  });
}

export async function down(knex: Knex): Promise<void> {
  // Re-add removed indexes (if needed)
  await knex.schema.alterTable('events', (table) => {
    table.index('domain', 'events_domain_index');
  });
  await knex.schema.alterTable('items', (table) => {
    table.index('code', 'items_code_index');
  });
  await knex.schema.alterTable('players', (table) => {
    table.index('domain', 'players_domain_index');
  });

  // Drop added indexes
  await knex.schema.alterTable('commands', (table) => {
    table.dropIndex('moduleId');
  });
  await knex.schema.alterTable('events', (table) => {
    table.dropIndex(['domain', 'createdAt']);
  });
  await knex.schema.alterTable('functions', (table) => {
    table.dropIndex('moduleId');
  });
  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.dropIndex(['gameServerId', 'domain']);
  });
}
