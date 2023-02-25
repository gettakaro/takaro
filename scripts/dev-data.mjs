#!/bin/node

import { Client, AdminClient, isAxiosError } from '@takaro/apiclient';
import { config } from 'dotenv';

config();

const adminClient = new AdminClient({
  url: process.env.TAKARO_HOST,
  auth: {
    adminSecret: process.env.ADMIN_SECRET,
  },
});

async function main() {
  const userEmail = `${process.env.USER_NAME}@${process.env.DOMAIN_NAME}.local`;

  const domainRes = await adminClient.domain.domainControllerCreate({
    name: process.env.DOMAIN_NAME,
  });

  const client = new Client({
    url: process.env.TAKARO_HOST,
    auth: {
      username: domainRes.data.data.rootUser.email,
      password: domainRes.data.data.password,
    },
  });

  await client.login();

  const userRes = await client.user.userControllerCreate({
    email: userEmail,
    password: process.env.USER_PASSWORD,
    name: process.env.USER_NAME,
  });

  await client.user.userControllerAssignRole(
    userRes.data.data.id,
    domainRes.data.data.rootRole.id
  );

  const gameserver = (await client.gameserver.gameServerControllerCreate({
    name: 'Test server',
    type: 'MOCK',
    connectionInfo: JSON.stringify({
      eventInterval: 10000,
    }),
  })).data.data;

  const modules = (await client.module.moduleControllerSearch()).data.data;

  for (const mod of modules) {
    console.log(`Installing module ${mod.name}...`);
    await client.gameserver.gameServerControllerInstallModule(gameserver.id, mod.id, { config: '{}' });
  }

  console.log('---------------------------------');
  console.log(`Created a domain with id ${domainRes.data.data.createdDomain.id}`);
  console.log(
    `Root user: ${domainRes.data.data.rootUser.email} / ${domainRes.data.data.password}`
  );
  console.log(
    `Created a user: ${userRes.data.data.email} / ${process.env.USER_PASSWORD}`
  );
}

main().catch((e) => {
  if (isAxiosError(e)) {
    console.error(JSON.stringify(e.response.data, null, 2));
  } else {
    console.error(e);
  }
  process.exit(1);
});
