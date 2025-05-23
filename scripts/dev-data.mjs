#!/bin/node

import { Client, AdminClient, isAxiosError, GameServerCreateDTOTypeEnum } from '@takaro/apiclient';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  url: process.env.TAKARO_HOST,
  auth: {
    clientSecret: process.env.ADMIN_CLIENT_SECRET,
  },
  log: false,
};

const adminClient = new AdminClient({
  url: config.url,
  auth: {
    clientId: config.auth.clientId,
    clientSecret: config.auth.clientSecret,
  },
  OAuth2URL: config.OAuth2URL,
  log: false,
});

async function main() {
  const domain1Result = await adminClient.domain.domainControllerCreate({
    name: process.env.TAKARO_DEV_DOMAIN_NAME,
    maxGameservers: 10,
  });

  const domain2Result = await adminClient.domain.domainControllerCreate({
    name: `${process.env.TAKARO_DEV_DOMAIN_NAME}2`,
  });

  console.log(`Created domain1 with id ${domain1Result.data.data.createdDomain.id}`);
  await addDataToDomain(domain1Result.data.data);

  console.log(`Created domain2 with id ${domain2Result.data.data.createdDomain.id}`);
  await addDataToDomain(domain2Result.data.data);

  console.log(`Root user: ${domain1Result.data.data.rootUser.email} / ${domain1Result.data.data.password}`);
  console.log(`Your server registration token: "${domain1Result.data.data.createdDomain.serverRegistrationToken}"`);
}

async function addDataToDomain(domain) {
  const client = new Client({
    url: process.env.TAKARO_HOST,
    auth: {
      username: domain.rootUser.email,
      password: domain.password,
    },
    log: false,
  });
  await client.login();

  const userEmail = `${process.env.TAKARO_DEV_USER_NAME}@${process.env.TAKARO_DEV_DOMAIN_NAME}`;
  const userRes = await client.user.userControllerCreate({
    email: userEmail,
    password: process.env.TAKARO_DEV_USER_PASSWORD,
    name: process.env.TAKARO_DEV_USER_NAME,
  });

  console.log(`Created a user: ${userRes.data.data.email} / ${process.env.TAKARO_DEV_USER_PASSWORD}`);
  await client.user.userControllerAssignRole(userRes.data.data.id, domain.rootRole.id);
}

main().catch((e) => {
  if (isAxiosError(e)) {
    console.error(JSON.stringify(e.response.data, null, 2));
  } else {
    console.error(e);
  }
  process.exit(1);
});
