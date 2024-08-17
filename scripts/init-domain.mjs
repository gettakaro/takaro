#!/bin/node

import { Client, AdminClient } from '@takaro/apiclient';
import crypto from 'crypto';

const takaroHost = process.env.TAKARO_HOST;
const adminClientSecret = process.env.ADMIN_CLIENT_SECRET;

if (!takaroHost) throw new Error('TAKARO_HOST is not set');
if (!adminClientSecret) throw new Error('ADMIN_CLIENT_SECRET is not set');

const userEmail = process.env.TAKARO_USER_EMAIL;
const domainName = process.env.TAKARO_DOMAIN_NAME;

if (!userEmail) throw new Error('TAKARO_USER_EMAIL is not set');
if (!domainName) throw new Error('TAKARO_DOMAIN_NAME is not set');

const userPassword = crypto.randomBytes(25).toString('base64');

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

  const client = new Client({
    url: takaroHost,
    auth: {
      username: domainRes.data.data.rootUser.email,
      password: domainRes.data.data.password,
    },
    log: false,
  });

  await client.login();

  const userRes = await client.user.userControllerCreate({
    email: userEmail,
    password: userPassword,
    name: userEmail.split('@')[0],
  });

  console.log(`Created a user: ${userRes.data.data.email} / ${userPassword}`);

  await client.user.userControllerAssignRole(userRes.data.data.id, domainRes.data.data.rootRole.id);
}

main().catch(console.error);
