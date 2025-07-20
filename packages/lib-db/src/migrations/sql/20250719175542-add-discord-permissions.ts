import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex('permission').insert([
    {
      permission: 'VIEW_DISCORD_INFO',
      description: 'Can view Discord guild information including channels and roles',
      friendlyName: 'View Discord Info',
    },
    {
      permission: 'SEND_DISCORD_MESSAGE',
      description: 'Can send messages to Discord channels',
      friendlyName: 'Send Discord Messages',
    },
  ]);
}

export async function down(knex: Knex): Promise<void> {
  await knex('permission').whereIn('permission', ['VIEW_DISCORD_INFO', 'SEND_DISCORD_MESSAGE']).del();
}
