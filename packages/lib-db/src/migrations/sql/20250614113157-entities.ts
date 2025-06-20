import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('entities', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.timestamps(true, true, true);
    table.string('domain').references('domains.id').onDelete('CASCADE').notNullable();
    table.uuid('gameserverId').references('gameservers.id').onDelete('CASCADE').notNullable();
    table.string('name').notNullable();
    table.string('code').notNullable();
    table.text('description').nullable();
    table.enum('type', ['hostile', 'friendly', 'neutral']).nullable();
    table.jsonb('metadata').nullable();
    // Add index on code since we'll use that in queries a lot
    table.index('code');
    // Add unique constraint to prevent duplicates
    table.unique(['code', 'gameserverId', 'domain']);
  });

  // Insert entity permissions
  await knex('permission').insert([
    {
      permission: 'READ_ENTITIES',
      description: 'Can view entity details',
      friendlyName: 'Read Entities',
    },
    {
      permission: 'MANAGE_ENTITIES',
      description: 'Can create, update, and delete entities',
      friendlyName: 'Manage Entities',
    },
  ]);
}

export async function down(knex: Knex): Promise<void> {
  // Remove entity permissions
  await knex('permission').whereIn('permission', ['READ_ENTITIES', 'MANAGE_ENTITIES']).del();

  await knex.schema.dropTable('entities');
}
