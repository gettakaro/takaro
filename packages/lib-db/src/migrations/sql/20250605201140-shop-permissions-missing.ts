import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex('permission').insert([
    {
      permission: 'MANAGE_SHOP_LISTINGS',
      description: 'Manage shop listings',
      friendlyName: 'Manage Shop Listings',
    },
    {
      permission: 'MANAGE_SHOP_ORDERS',
      description: 'Manage shop orders, allowing administrative actions on orders not belonging to the user',
      friendlyName: 'Manage Shop Orders',
    },
  ]);
}

export async function down(knex: Knex): Promise<void> {
  await knex('permission').whereIn('permission', ['MANAGE_SHOP_LISTINGS', 'MANAGE_SHOP_ORDERS']).del();
}
