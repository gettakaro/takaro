import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Find all variables where key starts with 'tp_'
  const variables = await knex('variables').select().where('key', 'like', 'tp_%');

  // Reduce the list to only public teleports
  const publicTeleports = variables.filter((variable) => {
    const value = JSON.parse(variable.value);
    return value.public;
  });

  // Change the key for all public teleports from tp_xxx to pubtp_xxx
  await Promise.all(
    publicTeleports.map((teleport) => {
      return knex('variables')
        .update({ key: `pub${teleport.key}` })
        .where('id', teleport.id);
    })
  );
}

export async function down(_knex: Knex): Promise<void> {
  // ... no down here, this is a one-way migration
}
