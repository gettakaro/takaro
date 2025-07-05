import { Knex } from 'knex';

/**
 * These indexes singificantly improve performance of the gameserver delete operation
 * CREATE INDEX idx_itemonshoplisting_itemid ON "itemOnShopListing" ("itemId");
 * CREATE INDEX idx_playerinventory_itemid ON "playerInventory" ("itemId");
 * CREATE INDEX idx_playeriphistory_gameserverid ON "playerIpHistory" ("gameServerId");
 * CREATE INDEX idx_shoplisting_gameserverid ON "shopListing" ("gameServerId");
 *
 * @param knex
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .alterTable('itemOnShopListing', (table) => {
      table.index(['itemId'], 'idx_itemonshoplisting_itemid');
    })
    .alterTable('playerInventory', (table) => {
      table.index(['itemId'], 'idx_playerinventory_itemid');
    })
    .alterTable('playerIpHistory', (table) => {
      table.index(['gameServerId'], 'idx_playeriphistory_gameserverid');
    })
    .alterTable('shopListing', (table) => {
      table.index(['gameServerId'], 'idx_shoplisting_gameserverid');
    });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .alterTable('itemOnShopListing', (table) => {
      table.dropIndex([], 'idx_itemonshoplisting_itemid');
    })
    .alterTable('playerInventory', (table) => {
      table.dropIndex([], 'idx_playerinventory_itemid');
    })
    .alterTable('playerIpHistory', (table) => {
      table.dropIndex([], 'idx_playeriphistory_gameserverid');
    })
    .alterTable('shopListing', (table) => {
      table.dropIndex([], 'idx_shoplisting_gameserverid');
    });
}
