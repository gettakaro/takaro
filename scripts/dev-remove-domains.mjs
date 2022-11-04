#!/bin/node

import { AdminClient, isAxiosError } from '@takaro/apiclient';
import { config } from 'dotenv';

config();

const adminClient = new AdminClient({
  url: process.env.TAKARO_HOST,
  auth: {
    adminSecret: process.env.ADMIN_SECRET,
  },
});

async function main() {
  const domains = await adminClient.domain.domainControllerSearch();

  const promises = domains.data.data.map(async (domain) => {
    try {
      await adminClient.domain.domainControllerRemove(domain.id);
    } catch {
      throw new Error(`Could not remove ${domain.name} - ${domain.id}`);
    }
  });

  await Promise.all(promises);
}

main().catch((e) => {
  if (isAxiosError(e)) {
    console.error(JSON.stringify(e.response.data, null, 2));
  } else {
    console.error(e);
  }
  process.exit(1);
});
