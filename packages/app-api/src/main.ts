import { HTTP } from '@takaro/http';
import { UserController } from './controllers/UserController';

const server = new HTTP({ controllers: [UserController] });

async function main() {
  await server.start();
}

main();
