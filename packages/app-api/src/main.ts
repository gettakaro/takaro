import { HTTP } from '@takaro/http';
import { UserController } from './controllers/UserController';

async function main() {
  const server = new HTTP({ controllers: [UserController] });
  await server.start();
}

main();
