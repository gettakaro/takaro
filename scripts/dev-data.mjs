#!/bin/node

import { Client, AdminClient, isAxiosError } from '@takaro/apiclient';
import { config } from 'dotenv';

config();

const adminClient = new AdminClient({
  url: process.env.TAKARO_HOST,
  auth: {
    clientId: process.env.ADMIN_CLIENT_ID,
    clientSecret: process.env.ADMIN_CLIENT_SECRET,
  },
  OAuth2URL: process.env.TAKARO_OAUTH_HOST,
  log: false
});

async function main() {
  const userEmail = `${process.env.TAKARO_DEV_USER_NAME}@${process.env.TAKARO_DEV_DOMAIN_NAME}`;

  const domainRes = await adminClient.domain.domainControllerCreate({
    name: process.env.TAKARO_DEV_DOMAIN_NAME,
  });

  console.log(
    `Created a domain with id ${domainRes.data.data.createdDomain.id}`
  );
  console.log(
    `Root user: ${domainRes.data.data.rootUser.email} / ${domainRes.data.data.password}`
  );

  const client = new Client({
    url: process.env.TAKARO_HOST,
    auth: {
      username: domainRes.data.data.rootUser.email,
      password: domainRes.data.data.password,
    },
    log: false
  });

  await client.login();

  const userRes = await client.user.userControllerCreate({
    email: userEmail,
    password: process.env.TAKARO_DEV_USER_PASSWORD,
    name: process.env.TAKARO_DEV_USER_NAME,
  });

  console.log(
    `Created a user: ${userRes.data.data.email} / ${process.env.TAKARO_DEV_USER_PASSWORD}`
  );

  await client.user.userControllerAssignRole(
    userRes.data.data.id,
    domainRes.data.data.rootRole.id
  );

  const gameserver = (
    await client.gameserver.gameServerControllerCreate({
      name: 'Test server',
      type: 'MOCK',
      connectionInfo: JSON.stringify({
        eventInterval: 10000,
        host: 'http://127.0.0.1:3002',
        name: 'takaro-development'
      }),
    })
  ).data.data;

  console.log(`Created a mock gameserver with id ${gameserver.id}`);

  const modules = (await client.module.moduleControllerSearch()).data.data;

  for (const mod of modules) {
    await client.gameserver.gameServerControllerInstallModule(
      gameserver.id,
      mod.id,
    );
    console.log(`Installed module ${mod.name}`);
  }
}

main().catch((e) => {
  if (isAxiosError(e)) {
    console.error(JSON.stringify(e.response.data, null, 2));
  } else {
    console.error(e);
  }
  process.exit(1);
});
