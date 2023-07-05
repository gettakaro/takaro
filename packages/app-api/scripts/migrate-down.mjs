import { migrateUndo } from '@takaro/db';

async function main() {
  await migrateUndo();
}

main().catch(console.error);