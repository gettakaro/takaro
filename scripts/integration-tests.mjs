import { randomUUID } from 'crypto';
import { upMany, logs, exec, upAll, down, run, pullAll } from 'docker-compose';
import { $ } from 'zx';
import { writeFile, mkdir } from 'fs/promises';

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
  TAKARO_OAUTH_HOST: process.env.IS_E2E ? 'http://127.0.0.1:14444' : 'http://hydra:4444',
  MOCHA_RETRIES: 5,
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
  await mkdir('./reports/integrationTests', { recursive: true });

  await exec('docker', ['network', 'create', 'takaro']);

  console.log('Bringing up datastores');
  await upMany(['postgresql', 'redis', 'postgresql_kratos', 'postgresql_hydra'], composeOpts);
  await sleep(1000);

  console.log('Running SQL migrations...');
  await run('hydra-migrate', 'migrate -c /etc/config/hydra/hydra.yml sql -e --yes', { ...composeOpts, log: false });
  await run('kratos-migrate', '-c /etc/config/kratos/kratos.yml migrate sql -e --yes', { ...composeOpts, log: false });

  await upMany(['kratos', 'hydra', 'hydra-e2e'], composeOpts);

  await Promise.all([
    waitUntilHealthyHttp('http://127.0.0.1:4433/health/ready', 60),
    waitUntilHealthyHttp('http://127.0.0.1:4444/health/ready', 60),
    waitUntilHealthyHttp('http://127.0.0.1:14444/health/ready', 60),
  ]);

  // Check if ADMIN_CLIENT_ID and ADMIN_CLIENT_SECRET are set already
  // If not set, create them
  if (!composeOpts.env.ADMIN_CLIENT_ID || !composeOpts.env.ADMIN_CLIENT_SECRET) {
    console.log('No OAuth admin client configured, creating one...');
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

  console.log('Pulling latest images...');
  await pullAll({ ...composeOpts, log: false });

  console.log('Running Takaro SQL migrations...');
  await run('takaro_api', 'npm -w packages/app-api run db:migrate', composeOpts);

  console.log('Starting all containers...');
  await upAll(composeOpts);

  let failed = false;

  try {
    await Promise.all([
      waitUntilHealthyHttp('http://127.0.0.1:13000/healthz', 60),
      waitUntilHealthyHttp('http://127.0.0.1:13001', 60),
      waitUntilHealthyHttp('http://127.0.0.1:3002/healthz', 60),
      waitUntilHealthyHttp('http://127.0.0.1:3003/healthz', 60),
    ]);

    console.log('Running tests with config', composeOpts);

    if (process.env.IS_E2E) {
      // Environment variables don't seem to propagate to the child processes when using the _normal_ method with zx
      // So we're hacking it like this instead :)
      const testVars = {
        TEST_HTTP_TARGET: 'http://127.0.0.1:13000',
        TEST_FRONTEND_TARGET: 'http://127.0.0.1:13001',
        ADMIN_CLIENT_ID: `${composeOpts.env.ADMIN_CLIENT_ID}`,
        ADMIN_CLIENT_SECRET: `${composeOpts.env.ADMIN_CLIENT_SECRET}`,
        TAKARO_OAUTH_HOST: 'http://127.0.0.1:14444 ',
        MOCK_GAMESERVER_HOST: 'http://takaro_mock_gameserver:3002',
        MAILHOG_URL: 'http://127.0.0.1:8025',
      };

      for (const [key, value] of Object.entries(testVars)) {
        $.prefix += `${key}=${value} `;
      }

      await $`npm run --workspace=./packages/e2e test:e2e`;
    } else {
      await run('takaro', 'npm run test', { ...composeOpts, NODE_ENV: 'test' });
    }
  } catch (error) {
    console.error('Tests failed');
    failed = true;
  }

  const logsResult = await logs(
    ['takaro_api', 'takaro_mock_gameserver', 'takaro_connector', 'kratos', 'hydra', 'hydra-e2e'],
    { ...composeOpts, log: false }
  );

  await writeFile('./reports/integrationTests/docker-logs.txt', logsResult.out);
  await writeFile('./reports/integrationTests/docker-logs-err.txt', logsResult.err);

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
