#!/bin/node

import { Client, AdminClient } from '@takaro/apiclient';

const takaroHost = process.env.TAKARO_HOST;
const adminClientSecret = process.env.ADMIN_CLIENT_SECRET;

if (!takaroHost) throw new Error('TAKARO_HOST is not set');
if (!adminClientSecret) throw new Error('ADMIN_CLIENT_SECRET is not set');

const domainName = process.env.TAKARO_DOMAIN_NAME;

if (!domainName) throw new Error('TAKARO_DOMAIN_NAME is not set');

const adminClient = new AdminClient({
  url: takaroHost,
  auth: {
    clientSecret: adminClientSecret,
  },
  //log: false,
});

async function main() {
  try {
    await adminClient.waitUntilHealthy();
  } catch (error) {
    console.error('Could not connect to Takaro API, is your config correct?');
  }

  const domainRes = await adminClient.domain.domainControllerCreate({
    name: domainName,
  });

  console.log(`Created a domain with id ${domainRes.data.data.createdDomain.id}`);
  console.log(`Root user: ${domainRes.data.data.rootUser.email} / ${domainRes.data.data.password}`);
}

main().catch(console.error);
