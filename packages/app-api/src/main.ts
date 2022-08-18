import { HTTP } from '@takaro/http';
import { DomainController } from './controllers/DomainController';
import { config } from './config';

export const server = new HTTP(
  { controllers: [DomainController] },
  { port: config.get('http.port') }
);

async function main() {
  config.validate();
  await server.start();
}

main();
