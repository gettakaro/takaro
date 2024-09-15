import { Client } from '@takaro/apiclient';

export { getTakaro } from './getTakaro.js';

export { checkPermission } from './checkPermission.js';
export { nextCronJobRun } from './nextCronJobRun.js';
export { TakaroUserError } from './TakaroUserError.js';
export * as _ from 'lodash-es';
export * as axios from 'axios';

// This is a dummy client object to be used in tests/local development
// It ensures that we get proper types when using the dynamically imported client
export const takaro: Client = {} as unknown as Client;
