import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Step 1: Create trigger function that auto-cancels orders when listing is deleted
  await knex.raw(`
    CREATE OR REPLACE FUNCTION cancel_orders_on_listing_delete()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Only proceed if deletedAt changed from NULL to a value (soft-delete)
      IF OLD."deletedAt" IS NULL AND NEW."deletedAt" IS NOT NULL THEN
        -- Cancel all PAID orders for this listing and refund currency
        -- Aggregate refunds by player to handle multiple orders correctly
        WITH orders_to_cancel AS (
          SELECT
            so.id AS order_id,
            so."playerId",
            NEW."gameServerId",
            NEW.domain AS domain,
            NEW.price * so.amount AS refund_amount
          FROM "shopOrder" so
          WHERE so."listingId" = NEW.id
            AND so.status = 'PAID'
        ),
        aggregated_refunds AS (
          SELECT
            "playerId",
            "gameServerId",
            domain,
            SUM(refund_amount) AS total_refund
          FROM orders_to_cancel
          GROUP BY "playerId", "gameServerId", domain
        )
        -- Update playerOnGameServer currency with aggregated total
        UPDATE "playerOnGameServer" pogs
        SET currency = pogs.currency + ar.total_refund
        FROM aggregated_refunds ar
        WHERE pogs."playerId" = ar."playerId"
          AND pogs."gameServerId" = ar."gameServerId"
          AND pogs.domain = ar.domain;

        -- Update order status to CANCELED
        UPDATE "shopOrder"
        SET status = 'CANCELED'
        WHERE "listingId" = NEW.id
          AND status = 'PAID';
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Step 2: Create trigger on shopListing table
  await knex.raw(`
    CREATE TRIGGER auto_cancel_orders_on_listing_delete
    AFTER UPDATE ON "shopListing"
    FOR EACH ROW
    WHEN (OLD."deletedAt" IS NULL AND NEW."deletedAt" IS NOT NULL)
    EXECUTE FUNCTION cancel_orders_on_listing_delete();
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop trigger
  await knex.raw(`
    DROP TRIGGER IF EXISTS auto_cancel_orders_on_listing_delete ON "shopListing";
  `);

  // Drop function
  await knex.raw(`
    DROP FUNCTION IF EXISTS cancel_orders_on_listing_delete();
  `);

  // Note: We don't reverse the data cleanup since those were genuinely bad orders
}
