import { logger } from '@csmm/shared';

import { getDatabase } from './database';
import { getHttpServer } from './http';

const log = logger('main');

async function main() {
    try {
        await getDatabase();
    } catch (error) {
        log.error('Cannot connect to database, aborting.');
        process.exit(1);
    }
    await getHttpServer();
}

main()
.then(() => {
    log.info('Successfully initialized!');
})
.catch(e => {
    log.error(e);
    process.exit(1);
});