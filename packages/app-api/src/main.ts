import { HTTP } from '@takaro/http';
import { DomainController } from './controllers/DomainController';
import { config } from './config';
import { UserController } from './controllers/UserController';
import { RoleController } from './controllers/Rolecontroller';

export const server = new HTTP(
  { controllers: [DomainController, UserController, RoleController] },
  { port: config.get('http.port') }
);

async function main() {
  config.validate();
  await server.start();
}

main();
