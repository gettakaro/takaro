import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('new_settings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.timestamps(true, true, true);
    table.string('domain').references('domains.id').onDelete('CASCADE').notNullable();
    table.uuid('gameServerId').references('id').inTable('gameservers').onDelete('CASCADE');
    table.string('key').notNullable();
    table.string('value').notNullable();
    // Setting key should be unique with gameServerId
    table.unique(['domain', 'key', 'gameServerId']);
  });

  // Migrate data from settings to new_settings
  const settings = await knex.select('*').from('settings');

  for (const setting of settings) {
    const domain = setting.domain;
    for (const [key, value] of Object.entries(setting)) {
      if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'domain') {
        const existing = await knex.select('*').from('new_settings').where({ key, domain }).first();

        if (existing) {
          continue;
        }

        await knex('new_settings').insert({
          key,
          value: String(value),
          domain,
        });
      }
    }
  }

  const gameServerSettings = await knex.select('*').from('gameServerSettings');

  for (const setting of gameServerSettings) {
    const gameServerId = setting.gameServerId;
    const domain = setting.domain;

    for (const [key, value] of Object.entries(setting)) {
      if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'gameServerId' && key !== 'domain') {
        const existing = await knex.select('*').from('new_settings').where({ key, domain, gameServerId }).first();

        if (existing) {
          continue;
        }

        await knex('new_settings').insert({
          key,
          value: String(value),
          gameServerId,
          domain,
        });
      }
    }
  }

  await knex.schema.dropTable('gameServerSettings');
  await knex.schema.dropTable('settings');
  await knex.schema.renameTable('new_settings', 'settings');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.renameTable('settings', 'new_settings');
  await knex.schema.createTable('settings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('key').notNullable();
    table.string('value').notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('gameServerSettings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.uuid('gameServerId').references('id').inTable('gameservers').onDelete('CASCADE');
    table.string('key').notNullable();
    table.string('value').notNullable();
    table.timestamps(true, true);
  });

  // Migrate data from new_settings to settings
  const settings = await knex.select('*').from('new_settings');

  for (const setting of settings) {
    for (const [key, value] of Object.entries(setting)) {
      if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
        await knex('settings').insert({
          key,
          value: String(value),
        });
      }
    }
  }

  const gameServerSettings = await knex.select('*').from('new_settings').whereNotNull('gameServerId');

  for (const setting of gameServerSettings) {
    const gameServerId = setting.gameServerId;

    for (const [key, value] of Object.entries(setting)) {
      if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'gameServerId') {
        await knex('gameServerSettings').insert({
          key,
          value: String(value),
          gameServerId,
        });
      }
    }
  }

  await knex.schema.dropTable('new_settings');
}
