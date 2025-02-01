import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('domains', (table) => {
    table.integer('maxGameservers').defaultTo(1);
    table.integer('maxUsers').defaultTo(1);
    table.integer('eventRetentionDays').defaultTo(7);
    table.integer('maxVariables').defaultTo(10000);
    table.integer('maxModules').defaultTo(1000);
    table.integer('maxFunctionsInModule').defaultTo(50);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('domains', (table) => {
    table.dropColumn('maxGameservers');
    table.dropColumn('maxUsers');
    table.dropColumn('eventRetentionDays');
    table.dropColumn('maxVariables');
    table.dropColumn('maxModules');
    table.dropColumn('maxFunctionsInModule');
  });
}
