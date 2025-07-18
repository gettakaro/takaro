import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // First, drop the primary key constraint from the parent table
  await knex.raw(`
    ALTER TABLE "playerInventoryHistory" 
    DROP CONSTRAINT IF EXISTS "playerInventoryHistory_pkey"
  `);

  // Get all existing partitions and drop their primary key constraints
  const partitions = await knex.raw(`
    SELECT 
      inhrelid::regclass AS partition_name
    FROM pg_inherits
    WHERE inhparent = '"playerInventoryHistory"'::regclass
  `);

  for (const partition of partitions.rows) {
    // partition_name already includes schema, need to extract just the table name
    const fullName = partition.partition_name;
    const partitionName = fullName.includes('.')
      ? fullName.split('.').pop().replace(/"/g, '')
      : fullName.replace(/"/g, '');
    await knex.raw(`
      ALTER TABLE "${partitionName}" 
      DROP CONSTRAINT IF EXISTS "${partitionName}_pkey"
    `);
  }

  // Create a regular (non-unique) composite index for query performance
  // This replaces the primary key constraint functionality for lookups
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS "playerInventoryHistory_createdAt_playerId_itemId_idx" 
    ON "playerInventoryHistory" ("createdAt", "playerId", "itemId")
  `);

  // Update the partition creation function to not include the composite primary key
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
}

export async function down(knex: Knex): Promise<void> {
  // Drop the new index
  await knex.raw(`
    DROP INDEX IF EXISTS "playerInventoryHistory_createdAt_playerId_itemId_idx"
  `);

  // No need to drop any primary key since we didn't add one in the up migration

  // Restore the original composite primary key on the parent table
  await knex.raw(`
    ALTER TABLE "playerInventoryHistory" 
    ADD CONSTRAINT "playerInventoryHistory_pkey" PRIMARY KEY ("createdAt", "playerId", "itemId")
  `);

  // Get all existing partitions and restore their primary key constraints
  const partitions = await knex.raw(`
    SELECT 
      inhrelid::regclass AS partition_name
    FROM pg_inherits
    WHERE inhparent = '"playerInventoryHistory"'::regclass
  `);

  for (const partition of partitions.rows) {
    // partition_name already includes schema, need to extract just the table name
    const fullName = partition.partition_name;
    const partitionName = fullName.includes('.')
      ? fullName.split('.').pop().replace(/"/g, '')
      : fullName.replace(/"/g, '');
    await knex.raw(`
      ALTER TABLE "${partitionName}" 
      ADD CONSTRAINT "${partitionName}_pkey" PRIMARY KEY ("createdAt", "playerId", "itemId")
    `);
  }

  // Restore the original partition creation function with the composite primary key
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
}
