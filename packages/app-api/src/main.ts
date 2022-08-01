import { HTTP } from '@takaro/http';

const server = new HTTP();

async function main() {
  await server.start();
}

main();
