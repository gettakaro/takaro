import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex('permission').insert([
    {
      permission: 'READ_ITEMS',
      description: 'Can view item details',
      friendlyName: 'Read Items',
    },
    {
      permission: 'MANAGE_ITEMS',
      description: 'Can create, update, and delete items',
      friendlyName: 'Manage Items',
    },
  ]);
}

export async function down(knex: Knex): Promise<void> {
  await knex('permission').whereIn('permission', ['READ_ITEMS', 'MANAGE_ITEMS']).del();
}
