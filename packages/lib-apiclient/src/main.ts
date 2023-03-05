import { AxiosResponse } from 'axios';
export { AxiosResponse } from 'axios';
import axios from 'axios';

export const { isAxiosError } = axios.default;

export { AdminClient } from './lib/adminClient.js';
export { Client } from './lib/client.js';

export type ITakaroAPIAxiosResponse<T> = AxiosResponse<T>;

export * from './generated/api.js';
