import axios, { AxiosResponse } from 'axios';

export const isAxiosError = axios.isAxiosError;

export { AxiosResponse, AxiosError } from 'axios';

export { AdminClient } from './lib/adminClient';
export { Client } from './lib/client';

export type ITakaroAPIAxiosResponse<T> = AxiosResponse<T>;

export * from './generated/api';
