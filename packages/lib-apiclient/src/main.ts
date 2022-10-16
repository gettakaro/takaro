import { AxiosResponse } from 'axios';

export { AxiosError, AxiosResponse } from 'axios';

export { AdminClient } from './lib/adminClient';
export { Client } from './lib/client';

export type ITakaroAPIAxiosResponse<T> = AxiosResponse<T>;

export * from './generated/api';
