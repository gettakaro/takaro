import { database, logger } from '@takaro/shared';

import { getHttpServer } from './http';

const log = logger('main');

async function main() {
  try {
    await database.getDatabase();
  } catch (error) {
    log.error('Cannot connect to database, aborting.');
    log.error(error);
    process.exit(1);
  }
  await getHttpServer();
}

main()
  .then(() => {
    log.info('Successfully initialized!');
  })
  .catch((e) => {
    log.error(e);
    process.exit(1);
  });
