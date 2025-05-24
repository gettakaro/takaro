import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create partitioned table using raw SQL since Knex doesn't have native partition support
  await knex.raw(`
    CREATE TABLE "playerLocation" (
      id UUID DEFAULT gen_random_uuid() NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      domain VARCHAR(255) NOT NULL,
      "playerId" UUID NOT NULL,
      x NUMERIC(10,3) NOT NULL,
      y NUMERIC(10,3) NOT NULL,
      z NUMERIC(10,3) NOT NULL,
      CONSTRAINT "playerLocation_pkey" PRIMARY KEY ("createdAt", "playerId"),
      CONSTRAINT "playerLocation_domain_foreign" FOREIGN KEY (domain) REFERENCES domains(id) ON DELETE CASCADE,
      CONSTRAINT "playerLocation_playerId_foreign" FOREIGN KEY ("playerId") REFERENCES "playerOnGameServer"(id) ON DELETE CASCADE
    ) PARTITION BY RANGE ("createdAt")
  `);

  // Create function to ensure partition exists for given date
  await knex.raw(`
    CREATE OR REPLACE FUNCTION ensure_player_location_partition(date_param VARCHAR DEFAULT NULL)
    RETURNS VOID AS $$
    DECLARE
      current_day_start DATE;
      next_day_start DATE;
      partition_name TEXT;
      partition_exists BOOLEAN;
      target_date DATE;
    BEGIN
      -- Parse date parameter or use current date
      IF date_param IS NOT NULL THEN
        target_date := DATE(date_param::TIMESTAMP);
      ELSE
        target_date := CURRENT_DATE;
      END IF;
      
      -- Calculate day boundaries for target date
      current_day_start := DATE_TRUNC('day', target_date);
      next_day_start := current_day_start + INTERVAL '1 day';
      
      -- Generate partition name (format: playerLocation_YYYY_MM_DD)
      partition_name := 'playerLocation_' || TO_CHAR(current_day_start, 'YYYY_MM_DD');
      
      -- Check if partition exists
      SELECT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = partition_name
          AND n.nspname = 'public'
      ) INTO partition_exists;
      
      -- Create partition if it doesn't exist
      IF NOT partition_exists THEN
        EXECUTE format(
          'CREATE TABLE %I PARTITION OF "playerLocation"
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

  // Create indexes
  await knex.raw(`CREATE INDEX "playerLocation_domain_createdAt_idx" ON "playerLocation" (domain, "createdAt")`);
  await knex.raw(`CREATE INDEX "playerLocation_playerId_idx" ON "playerLocation" ("playerId")`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP FUNCTION IF EXISTS ensure_player_location_partition(VARCHAR)');
  await knex.raw('DROP TABLE IF EXISTS "playerLocation" CASCADE');
}
