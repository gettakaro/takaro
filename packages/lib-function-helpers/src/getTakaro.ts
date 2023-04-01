import { Client } from '@takaro/apiclient';

export async function getTakaro(data: Record<string, string>): Promise<Client> {
  const takaro = new Client({
    url: data.url,
    auth: {
      token: data.token,
    },
  });

  return takaro;
}
