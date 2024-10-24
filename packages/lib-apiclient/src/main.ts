import { AxiosResponse } from 'axios';

export { AxiosResponse } from 'axios';
export { isAxiosError } from 'axios';
export { AdminClient } from './lib/adminClient.js';
export { Client } from './lib/client.js';
export { createAxios, CleanAxiosError } from './lib/baseAxios.js';

export type ITakaroAPIAxiosResponse<T> = AxiosResponse<T>;
export * from './generated/api.js';
