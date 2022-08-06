import { HTTP } from '@takaro/http';
import { DomainController } from './controllers/DomainController';

async function main() {
  const server = new HTTP({ controllers: [DomainController] });
  await server.start();
}

main();
