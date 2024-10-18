import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('shopOrder', (table) => {
    table.uuid('playerId').references('id').inTable('players');
  });

  // Migrate existing userId values to playerId by looking up the playerId from users
  const shopOrders = await knex('shopOrder').select('id', 'userId');
  for (const order of shopOrders) {
    const user = await knex('users').where('id', order.userId).first();
    if (user && user.playerId) {
      await knex('shopOrder').where('id', order.id).update('playerId', user.playerId);
    }
  }

  await knex.schema.alterTable('shopOrder', (table) => {
    table.dropColumn('userId');
    table.uuid('playerId').notNullable().alter();
    table.index('playerId');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Add userId column back to the shopOrder table
  await knex.schema.alterTable('shopOrder', (table) => {
    table.uuid('userId').references('id').inTable('users');
  });

  // Migrate playerId values back to userId by looking up the user from players
  const shopOrders = await knex('shopOrder').select('id', 'playerId');
  for (const order of shopOrders) {
    const player = await knex('players').where('id', order.playerId).first();
    if (player) {
      await knex('shopOrder').where('id', order.id).update('userId', player.id);
    }
  }

  // Drop playerId column
  await knex.schema.alterTable('shopOrder', (table) => {
    table.dropColumn('playerId');
    table.uuid('userId').notNullable().alter();
  });
}
