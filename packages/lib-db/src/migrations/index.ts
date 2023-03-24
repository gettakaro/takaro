import { getKnex } from '../knex.js';
import { readdir } from 'fs/promises';
import { Knex } from 'knex';
import path from 'node:path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
interface IMigration {
  name: string;
  up: (knex: Knex) => Promise<void>;
  down: (knex: Knex) => Promise<void>;
}

class TakaroMigrationSource {
  // Hack to get around ts compiler/monorepo/dynamic import weirdness
  // See: https://github.com/TypeStrong/ts-node/discussions/1290
  private dynamicImport = new Function('specifier', 'return import(specifier)');

  async getMigrations() {
    const folderPath = path.join(__dirname, 'sql');
    const files = await readdir(folderPath);
    const migrations = files
      .filter((file) => file.endsWith('.js'))
      .map((file) => {
        return this.dynamicImport(`${folderPath}/${file}`).then(
          (migration: IMigration) => {
            return {
              name: file,
              up: migration.up,
              down: migration.down,
            };
          }
        );
      });
    return Promise.all(migrations);
  }

  getMigrationName(migration: IMigration) {
    return migration.name;
  }

  async getMigration(migration: IMigration) {
    return migration;
  }
}

export async function migrate() {
  const knex = await getKnex();
  await knex.migrate.latest({
    migrationSource: new TakaroMigrationSource(),
  });
}
