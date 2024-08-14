import ms from 'ms';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('domains', (table) => {
    table.text('externalReference').nullable();
  });

  // Select all domains with name starting cus_ and set externalReference to the name
  const domains = await knex('domains').where('name', 'like', 'cus_%');
  await Promise.all(
    domains.map((domain) =>
      knex('domains').where('id', domain.id).update({
        externalReference: domain.name,
      }),
    ),
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('domains', (table) => {
    table.dropColumn('externalReference');
  });
}
