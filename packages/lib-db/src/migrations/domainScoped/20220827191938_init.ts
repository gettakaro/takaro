import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('name').notNullable();
    table.string('email').unique();
    table.string('password').notNullable();
  });

  await knex.schema.createTable('roles', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('name').unique();
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
      ])
      .notNullable();

    table.primary(['roleId', 'capability']);
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
  });

  await knex.schema.createTable('gameservers', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('name').unique();
    table.json('connectionInfo').notNullable();
  });

  await knex.schema.createTable('players', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('name').notNullable();
    table.string('platformId').notNullable();
    table.uuid('gameserver').references('gameservers.id').onDelete('CASCADE');
  });

  await knex.schema.createTable('functions', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('name').unique();
    table.string('code').notNullable();
  });

  await knex.schema.createTable('cronJobs', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('name').unique();
    table.string('temporalValue').notNullable();
    table.uuid('gameserver').references('gameservers.id').onDelete('CASCADE');
    table.uuid('function').references('functions.id').onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users');
}
