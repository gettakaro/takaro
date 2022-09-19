import { Client } from '@takaro/apiclient';

export function getClient(token: string, url: string) {
  return new Client({ url, auth: { token } });
}
