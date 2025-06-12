import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE "playerInventoryHistory" (
      id UUID DEFAULT gen_random_uuid() NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      domain VARCHAR(255) NOT NULL,
      "playerId" UUID NOT NULL,
      "itemId" UUID NOT NULL,
      quantity INTEGER NOT NULL,
      CONSTRAINT "playerInventoryHistory_pkey" PRIMARY KEY ("createdAt", "playerId", "itemId"),
      CONSTRAINT "playerInventoryHistory_domain_foreign" FOREIGN KEY (domain) REFERENCES domains(id) ON DELETE CASCADE,
      CONSTRAINT "playerInventoryHistory_playerId_foreign" FOREIGN KEY ("playerId") REFERENCES "playerOnGameServer"(id) ON DELETE CASCADE,
      CONSTRAINT "playerInventoryHistory_itemId_foreign" FOREIGN KEY ("itemId") REFERENCES items(id) ON DELETE CASCADE,
      CONSTRAINT "playerInventoryHistory_quantity_check" CHECK (quantity >= 0)
    ) PARTITION BY RANGE ("createdAt")
  `);

  await knex.raw(`
    CREATE OR REPLACE FUNCTION ensure_player_inventory_history_partition(date_param VARCHAR DEFAULT NULL)
    RETURNS VOID AS $$
    DECLARE
      current_day_start DATE;
      next_day_start DATE;
      partition_name TEXT;
      partition_exists BOOLEAN;
      target_date DATE;
    BEGIN
      IF date_param IS NOT NULL THEN
        target_date := DATE(date_param::TIMESTAMP);
      ELSE
        target_date := CURRENT_DATE;
      END IF;
      
      current_day_start := DATE_TRUNC('day', target_date);
      next_day_start := current_day_start + INTERVAL '1 day';
      
      partition_name := 'playerInventoryHistory_' || TO_CHAR(current_day_start, 'YYYY_MM_DD');
      
      SELECT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = partition_name
          AND n.nspname = 'public'
      ) INTO partition_exists;
      
      IF NOT partition_exists THEN
        EXECUTE format(
          'CREATE TABLE %I PARTITION OF "playerInventoryHistory"
           FOR VALUES FROM (%L) TO (%L)',
          partition_name,
          current_day_start,
          next_day_start
        );
        
        RAISE NOTICE 'Created partition: % for date: %',
          partition_name, current_day_start;
      END IF;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await knex.raw(
    `CREATE INDEX "playerInventoryHistory_domain_createdAt_idx" ON "playerInventoryHistory" (domain, "createdAt")`,
  );
  await knex.raw(`CREATE INDEX "playerInventoryHistory_playerId_idx" ON "playerInventoryHistory" ("playerId")`);
  await knex.raw(`CREATE INDEX "playerInventoryHistory_itemId_idx" ON "playerInventoryHistory" ("itemId")`);
  await knex.raw(
    `CREATE INDEX "playerInventoryHistory_playerId_createdAt_idx" ON "playerInventoryHistory" ("playerId", "createdAt" DESC)`,
  );

  // Delete the old playerInventory table
  await knex.raw('DROP TABLE IF EXISTS "playerInventory" CASCADE');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable('playerInventory', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.timestamps(true, true, true);
    table.string('domain').references('domains.id').onDelete('CASCADE').notNullable();
    table.uuid('playerId').references('playerOnGameServer.id').onDelete('CASCADE').notNullable();
    table.uuid('itemId').references('items.id').onDelete('CASCADE').notNullable();
    table.integer('quantity').notNullable();
  });

  await knex.raw('DROP FUNCTION IF EXISTS ensure_player_inventory_history_partition(VARCHAR)');
  await knex.raw('DROP TABLE IF EXISTS "playerInventoryHistory" CASCADE');
}
