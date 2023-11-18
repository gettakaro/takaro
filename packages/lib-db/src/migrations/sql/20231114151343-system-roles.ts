import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Ensure for each domainId, a role 'User' and a role 'Player' exists
  await knex.raw(`
    INSERT INTO roles (name, domain)
    SELECT 'User', id
    FROM domains
    WHERE NOT EXISTS (
      SELECT id
      FROM roles
      WHERE name = 'User'
      AND domain = domains.id
    );
  `);

  await knex.raw(`
    INSERT INTO roles (name, domain)
    SELECT 'Player', id
    FROM domains
    WHERE NOT EXISTS (
      SELECT id
      FROM roles
      WHERE name = 'Player'
      AND domain = domains.id
    );
  `);

  // Add a 'system' flag to the role table
  await knex.schema.alterTable('roles', (table) => {
    table.boolean('system').defaultTo(false);
  });

  // Set system=true for the 'user', 'player' and 'root' roles
  await knex.raw(`
    UPDATE roles
    SET system = true
    WHERE name IN ('User', 'Player', 'root');
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('roles', (table) => {
    table.dropColumn('system');
  });
}
