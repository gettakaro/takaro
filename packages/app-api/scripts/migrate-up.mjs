import { migrate } from '@takaro/db';

async function main() {
  await migrate();
}

main().catch(console.error);