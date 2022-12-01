import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('domains', (table) => {
    table.timestamps(true, true, true);
    table.string('id').primary();
    table.string('name').unique();
  });

  await knex.schema.createTable('users', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('name').notNullable();
    table.string('email').unique();
    table.string('password').notNullable();

    table
      .string('domain')
      .references('domains.id')
      .onDelete('CASCADE')
      .notNullable();
  });

  await knex.schema.createTable('roles', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('name');

    table
      .string('domain')
      .references('domains.id')
      .onDelete('CASCADE')
      .notNullable();

    table.unique(['name', 'domain']);
  });

  await knex.schema.createTable('capabilityOnRole', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.uuid('roleId').references('id').inTable('roles').onDelete('CASCADE');
    table
      .enu('capability', [
        'ROOT',
        'MANAGE_USERS',
        'READ_USERS',
        'MANAGE_ROLES',
        'READ_ROLES',
        'MANAGE_GAMESERVERS',
        'READ_GAMESERVERS',
        'READ_FUNCTIONS',
        'MANAGE_FUNCTIONS',
        'READ_CRONJOBS',
        'MANAGE_CRONJOBS',
        'READ_HOOKS',
        'MANAGE_HOOKS',
        'READ_MODULES',
        'MANAGE_MODULES',
        'READ_PLAYERS',
        'MANAGE_PLAYERS',
      ])
      .notNullable();

    table.primary(['roleId', 'capability']);
    table
      .string('domain')
      .references('domains.id')
      .onDelete('CASCADE')
      .notNullable();
  });

  await knex.schema.createTable('roleOnUser', (table) => {
    table.timestamps(true, true, true);
    table
      .uuid('userId')
      .references('users.id')
      .onDelete('CASCADE')
      .notNullable();
    table
      .uuid('roleId')
      .references('roles.id')
      .onDelete('CASCADE')
      .notNullable();

    table.primary(['userId', 'roleId']);
  });

  await knex.schema.createTable('gameservers', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('name');
    table.enu('type', ['MOCK', 'SEVENDAYSTODIE', 'RUST']).notNullable();
    table.binary('connectionInfo').notNullable();
    table
      .string('domain')
      .references('domains.id')
      .onDelete('CASCADE')
      .notNullable();

    table.unique(['name', 'domain']);
  });

  await knex.schema.createTable('players', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('name').notNullable();
    table.string('steamId');
    table.string('xboxLiveId');
    table.string('epicOnlineServicesId');
    table
      .string('domain')
      .references('domains.id')
      .onDelete('CASCADE')
      .notNullable();
  });

  await knex.schema.createTable('playerOnGameServer', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table
      .uuid('playerId')
      .references('players.id')
      .onDelete('CASCADE')
      .notNullable();
    table
      .uuid('gameServerId')
      .references('gameservers.id')
      .onDelete('CASCADE')
      .notNullable();

    table.string('gameId').notNullable();

    table.primary(['playerId', 'gameServerId']);
    table
      .string('domain')
      .references('domains.id')
      .onDelete('CASCADE')
      .notNullable();
  });

  await knex.schema.createTable('functions', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('code').notNullable();
    table
      .string('domain')
      .references('domains.id')
      .onDelete('CASCADE')
      .notNullable();
  });

  await knex.schema.createTable('modules', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('name');
    table.boolean('enabled').notNullable().defaultTo(true);
    table.json('config').defaultTo('{}');
    table
      .string('domain')
      .references('domains.id')
      .onDelete('CASCADE')
      .notNullable();

    table.unique(['name', 'domain']);
  });

  await knex.schema.createTable('cronJobs', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('name');
    table.boolean('enabled').notNullable().defaultTo(true);
    table.string('temporalValue').notNullable();
    table
      .uuid('moduleId')
      .references('modules.id')
      .onDelete('CASCADE')
      .notNullable();
    table
      .string('domain')
      .references('domains.id')
      .onDelete('CASCADE')
      .notNullable();

    table.unique(['name', 'moduleId']);
  });

  await knex.schema.createTable('hooks', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('name');
    table.boolean('enabled').notNullable().defaultTo(true);
    table
      .enu('eventType', ['log', 'player-connected', 'player-disconnected'])
      .notNullable();
    table.string('regex').notNullable();
    table
      .uuid('moduleId')
      .references('modules.id')
      .onDelete('CASCADE')
      .notNullable();
    table
      .string('domain')
      .references('domains.id')
      .onDelete('CASCADE')
      .notNullable();

    table.unique(['name', 'moduleId']);
  });

  await knex.schema.createTable('commands', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('name');
    table.boolean('enabled').notNullable().defaultTo(true);
    table
      .uuid('moduleId')
      .references('modules.id')
      .onDelete('CASCADE')
      .notNullable();
    table
      .string('domain')
      .references('domains.id')
      .onDelete('CASCADE')
      .notNullable();

    table.unique(['name', 'moduleId']);
  });

  await knex.schema.createTable('functionAssignments', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table
      .uuid('function')
      .references('functions.id')
      .onDelete('CASCADE')
      .notNullable()
      .unique();
    table.uuid('cronJob').references('cronJobs.id').onDelete('CASCADE');
    table.uuid('hook').references('hooks.id').onDelete('CASCADE');
    table.uuid('command').references('commands.id').onDelete('CASCADE');
    table.check('(?? IS NOT NULL) OR (?? IS NOT NULL) OR (?? IS NOT NULL)', [
      'cronJob',
      'hook',
      'command',
    ]);
    table
      .string('domain')
      .references('domains.id')
      .onDelete('CASCADE')
      .notNullable();
  });

  await knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('domains');
  await knex.schema.dropTable('functionAssignments');
  await knex.schema.dropTable('commands');
  await knex.schema.dropTable('hooks');
  await knex.schema.dropTable('cronJobs');
  await knex.schema.dropTable('modules');
  await knex.schema.dropTable('functions');
  await knex.schema.dropTable('playerOnGameServer');
  await knex.schema.dropTable('players');
  await knex.schema.dropTable('gameservers');
  await knex.schema.dropTable('roleOnUser');
  await knex.schema.dropTable('roles');
  await knex.schema.dropTable('users');
}
