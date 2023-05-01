import { randomUUID } from 'crypto';
import { upMany, logs, exec, upAll, down } from 'docker-compose';
import { $ } from 'zx';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitUntilHealthyHttp(url, maxRetries = 5) {
  try {
    const { stdout } = await $`curl -s -o /dev/null -w "%{http_code}" ${url}`;
    if (stdout === '200') {
      return;
    }
  } catch (err) { }

  if (maxRetries > 0) {
    await sleep(1000);
    await waitUntilHealthyHttp(url, maxRetries - 1);
  } else {
    throw new Error(`Failed to connect to ${url} after ${maxRetries} retries`);
  }
}


// These passwords are not super secure but it's better than hardcoding something like 'super_secret_password' here
const POSTGRES_PASSWORD = randomUUID();
const POSTGRES_ENCRYPTION_KEY = randomUUID();

process.env = {
  ...process.env,
  POSTGRES_USER: 'takaro-test',
  POSTGRES_DB: 'takaro-test-db',
  POSTGRES_PASSWORD,
  POSTGRES_ENCRYPTION_KEY,
};

const composeOpts = {
  log: true,
  composeOptions: ['-f', 'docker-compose.test.yml'],
  env: {
    ...process.env,
  },
};

async function cleanUp() {
  console.log('Cleaning up any old data or containers...');
  await down({
    ...composeOpts,
    commandOptions: ['--remove-orphans', '--volumes'],
  });
}

async function main() {
  await cleanUp();
  console.log('Bringing up datastores');
  await upMany(
    ['postgresql', 'redis', 'postgresql_kratos', 'postgresql_hydra'],
    composeOpts
  );
  await sleep(1000);

  // Then, start supporting services
  await upMany(['kratos-migrate', 'hydra-migrate'], composeOpts);
  console.log('Waiting for SQL migrations to finish...');
  await sleep(1000);

  await upMany(['kratos', 'hydra'], composeOpts);

  // Check if ADMIN_CLIENT_ID and ADMIN_CLIENT_SECRET are set already
  // If not set, create them
  if (
    !composeOpts.env.ADMIN_CLIENT_ID ||
    !composeOpts.env.ADMIN_CLIENT_SECRET
  ) {
    await sleep(5000);
    const rawClientOutput = await exec(
      'hydra',
      'hydra -e http://localhost:4445  create client --grant-type client_credentials --audience t:api:admin --format json',
      composeOpts
    );
    const parsedClientOutput = JSON.parse(rawClientOutput.out);

    console.log('Created OAuth admin client', {
      clientId: parsedClientOutput.client_id,
    });
    composeOpts.env.ADMIN_CLIENT_ID = parsedClientOutput.client_id;
    composeOpts.env.ADMIN_CLIENT_SECRET = parsedClientOutput.client_secret;
  }

  await upAll(composeOpts);

  let failed = false;

  try {
    await Promise.all([
      waitUntilHealthyHttp('http://127.0.0.1:13000/healthz', 60),
      waitUntilHealthyHttp('http://127.0.0.1:3002/healthz', 60),
    ]);

    // Environment variables don't seem to propagate to the child processes when using the _normal_ method with zx
    // So we're hacking it like this instead :)
    const testVars = {
      POSTGRES_USER: `${process.env.POSTGRES_USER}`,
      POSTGRES_PASSWORD: `${POSTGRES_PASSWORD}`,
      POSTGRES_DB: `${process.env.POSTGRES_DB}`,
      POSTGRES_HOST: '127.0.0.1 ',
      POSTGRES_ENCRYPTION_KEY,
      TAKARO_OAUTH_ADMIN_HOST: 'http://127.0.0.1:4445',
      KRATOS_ADMIN_URL: 'http://127.0.0.1:4434',
      TAKARO_OAUTH_HOST: 'http://127.0.0.1:4444 ',
      TEST_HTTP_TARGET: 'http://127.0.0.1:13000',
      ADMIN_CLIENT_ID: `${composeOpts.env.ADMIN_CLIENT_ID}`,
      ADMIN_CLIENT_SECRET: `${composeOpts.env.ADMIN_CLIENT_SECRET}`,
      REDIS_HOST: '127.0.0.1',
      MOCK_GAMESERVER_HOST: 'http://takaro_mock_gameserver:3002'
    };

    for (const [key, value] of Object.entries(testVars)) {
      $.prefix += `${key}=${value} `;
    }
    console.log('Running tests with config', testVars);
    await $`npm test`;
  } catch (error) {
    console.error('Tests failed');
    failed = true;
  }

  await logs(['takaro_api', 'takaro_mock_gameserver'], composeOpts);
  await cleanUp();

  if (failed) {
    process.exit(1);
  }
}

main()
  .then((res) => {
    console.log(res);
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
