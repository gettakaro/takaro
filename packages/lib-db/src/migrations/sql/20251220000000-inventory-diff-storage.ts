import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create playerInventoryBaseline table - full inventory snapshots every hour
  await knex.raw(`
    CREATE TABLE "playerInventoryBaseline" (
      id UUID DEFAULT gen_random_uuid() NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      domain VARCHAR(255) NOT NULL,
      "playerId" UUID NOT NULL,
      "baselineId" UUID NOT NULL,
      "itemId" UUID NOT NULL,
      quantity INTEGER NOT NULL,
      quality VARCHAR(255),
      CONSTRAINT "playerInventoryBaseline_pkey" PRIMARY KEY ("createdAt", "baselineId", "itemId"),
      CONSTRAINT "playerInventoryBaseline_domain_foreign" FOREIGN KEY (domain) REFERENCES domains(id) ON DELETE CASCADE,
      CONSTRAINT "playerInventoryBaseline_playerId_foreign" FOREIGN KEY ("playerId") REFERENCES "playerOnGameServer"(id) ON DELETE CASCADE,
      CONSTRAINT "playerInventoryBaseline_itemId_foreign" FOREIGN KEY ("itemId") REFERENCES items(id) ON DELETE CASCADE,
      CONSTRAINT "playerInventoryBaseline_quantity_check" CHECK (quantity >= 0)
    ) PARTITION BY RANGE ("createdAt")
  `);

  // Create playerInventoryDiff table - individual item changes between baselines
  await knex.raw(`
    CREATE TABLE "playerInventoryDiff" (
      id UUID DEFAULT gen_random_uuid() NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      domain VARCHAR(255) NOT NULL,
      "playerId" UUID NOT NULL,
      "itemId" UUID NOT NULL,
      "changeType" VARCHAR(10) NOT NULL,
      "previousQuantity" INTEGER,
      "newQuantity" INTEGER,
      "previousQuality" VARCHAR(255),
      "newQuality" VARCHAR(255),
      CONSTRAINT "playerInventoryDiff_pkey" PRIMARY KEY ("createdAt", "playerId", "itemId"),
      CONSTRAINT "playerInventoryDiff_domain_foreign" FOREIGN KEY (domain) REFERENCES domains(id) ON DELETE CASCADE,
      CONSTRAINT "playerInventoryDiff_playerId_foreign" FOREIGN KEY ("playerId") REFERENCES "playerOnGameServer"(id) ON DELETE CASCADE,
      CONSTRAINT "playerInventoryDiff_itemId_foreign" FOREIGN KEY ("itemId") REFERENCES items(id) ON DELETE CASCADE,
      CONSTRAINT "playerInventoryDiff_changeType_check" CHECK ("changeType" IN ('added', 'removed', 'changed'))
    ) PARTITION BY RANGE ("createdAt")
  `);

  // Create partition function for playerInventoryBaseline
  await knex.raw(`
    CREATE OR REPLACE FUNCTION ensure_player_inventory_baseline_partition(date_param VARCHAR DEFAULT NULL)
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

      partition_name := 'playerInventoryBaseline_' || TO_CHAR(current_day_start, 'YYYY_MM_DD');

      SELECT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = partition_name
          AND n.nspname = 'public'
      ) INTO partition_exists;

      IF NOT partition_exists THEN
        EXECUTE format(
          'CREATE TABLE %I PARTITION OF "playerInventoryBaseline"
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

  // Create partition function for playerInventoryDiff
  await knex.raw(`
    CREATE OR REPLACE FUNCTION ensure_player_inventory_diff_partition(date_param VARCHAR DEFAULT NULL)
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

      partition_name := 'playerInventoryDiff_' || TO_CHAR(current_day_start, 'YYYY_MM_DD');

      SELECT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = partition_name
          AND n.nspname = 'public'
      ) INTO partition_exists;

      IF NOT partition_exists THEN
        EXECUTE format(
          'CREATE TABLE %I PARTITION OF "playerInventoryDiff"
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

  // Create indexes for playerInventoryBaseline
  await knex.raw(
    `CREATE INDEX "playerInventoryBaseline_domain_createdAt_idx" ON "playerInventoryBaseline" (domain, "createdAt")`,
  );
  await knex.raw(`CREATE INDEX "playerInventoryBaseline_playerId_idx" ON "playerInventoryBaseline" ("playerId")`);
  await knex.raw(
    `CREATE INDEX "playerInventoryBaseline_playerId_createdAt_idx" ON "playerInventoryBaseline" ("playerId", "createdAt" DESC)`,
  );
  await knex.raw(`CREATE INDEX "playerInventoryBaseline_baselineId_idx" ON "playerInventoryBaseline" ("baselineId")`);

  // Create indexes for playerInventoryDiff
  await knex.raw(
    `CREATE INDEX "playerInventoryDiff_domain_createdAt_idx" ON "playerInventoryDiff" (domain, "createdAt")`,
  );
  await knex.raw(`CREATE INDEX "playerInventoryDiff_playerId_idx" ON "playerInventoryDiff" ("playerId")`);
  await knex.raw(
    `CREATE INDEX "playerInventoryDiff_playerId_createdAt_idx" ON "playerInventoryDiff" ("playerId", "createdAt" DESC)`,
  );
  await knex.raw(
    `CREATE INDEX "playerInventoryDiff_itemId_createdAt_idx" ON "playerInventoryDiff" ("itemId", "createdAt" DESC)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP FUNCTION IF EXISTS ensure_player_inventory_baseline_partition(VARCHAR)');
  await knex.raw('DROP FUNCTION IF EXISTS ensure_player_inventory_diff_partition(VARCHAR)');
  await knex.raw('DROP TABLE IF EXISTS "playerInventoryBaseline" CASCADE');
  await knex.raw('DROP TABLE IF EXISTS "playerInventoryDiff" CASCADE');
}
