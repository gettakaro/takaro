import { randomUUID } from 'crypto';
import { upMany, logs, upAll, down, run, pullAll, buildOne } from 'docker-compose/dist/v2.js';
import { $ } from 'zx';
import { writeFile, mkdir } from 'fs/promises';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logTiming(phase, startTime) {
  const duration = Date.now() - startTime;
  console.log(`[CI_TIMING] ${phase}: ${duration}ms`);
  return duration;
}

async function waitUntilHealthyHttp(url, maxRetries = 5) {
  try {
    const { stdout } = await $`curl -s -o /dev/null -w "%{http_code}" ${url}`;
    if (stdout === '200') {
      return;
    }
  } catch (err) {}

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
  const mainStart = Date.now();
  let phaseStart;

  phaseStart = Date.now();
  await cleanUp();
  logTiming('cleanup', phaseStart);

  await mkdir('./reports/integrationTests', { recursive: true });

  phaseStart = Date.now();
  console.log('Bringing up datastores');
  await upMany(['postgresql', 'redis', 'postgresql_kratos'], composeOpts);
  await sleep(1000);
  logTiming('datastore_startup', phaseStart);

  phaseStart = Date.now();
  console.log('Running SQL migrations...');
  await run('kratos-migrate', '-c /etc/config/kratos/kratos.yml migrate sql -e --yes', { ...composeOpts, log: false });
  logTiming('kratos_migration', phaseStart);

  phaseStart = Date.now();
  await upMany(['kratos'], composeOpts);
  await Promise.all([waitUntilHealthyHttp('http://127.0.0.1:4433/health/ready', 60)]);
  logTiming('kratos_startup_and_health', phaseStart);

  // Check if ADMIN_CLIENT_SECRET is set already if not set, create them
  if (!composeOpts.env.ADMIN_CLIENT_SECRET) {
    console.log('No admin secret configured, creating one...');
    composeOpts.env.ADMIN_CLIENT_SECRET = randomUUID();
  }

  phaseStart = Date.now();
  console.log('Pulling latest images...');
  await pullAll({ ...composeOpts, log: false });
  logTiming('docker_pull', phaseStart);

  phaseStart = Date.now();
  console.log('Running Takaro SQL migrations...');
  await run('takaro_api', 'npm -w packages/app-api run db:migrate', composeOpts);
  logTiming('takaro_migration', phaseStart);

  phaseStart = Date.now();
  console.log('Building Takaro test image...');
  await buildOne('takaro', { ...composeOpts, log: false });
  logTiming('docker_build', phaseStart);

  phaseStart = Date.now();
  console.log('Starting all containers...');
  await upAll(composeOpts);
  logTiming('container_startup', phaseStart);

  let failed = false;

  try {
    phaseStart = Date.now();
    await Promise.all([
      waitUntilHealthyHttp('http://127.0.0.1:13000/healthz', 60),
      waitUntilHealthyHttp('http://127.0.0.1:13001', 60),
      waitUntilHealthyHttp('http://127.0.0.1:3002/healthz', 60),
      waitUntilHealthyHttp('http://127.0.0.1:3003/healthz', 60),
    ]);
    logTiming('health_checks', phaseStart);

    phaseStart = Date.now();
    if (process.env.IS_E2E) {
      // Environment variables don't seem to propagate to the child processes when using the _normal_ method with zx
      // So we're hacking it like this instead :)
      const testVars = {
        TEST_HTTP_TARGET: 'http://127.0.0.1:13000',
        TEST_FRONTEND_TARGET: 'http://127.0.0.1:13001',
        ADMIN_CLIENT_SECRET: `${composeOpts.env.ADMIN_CLIENT_SECRET}`,
        MOCK_GAMESERVER_HOST: 'http://takaro_mock_gameserver:3002',
        MAILHOG_URL: 'http://127.0.0.1:8025',
      };

      for (const [key, value] of Object.entries(testVars)) {
        $.prefix += `${key}=${value} `;
      }

      await $`npm run --workspace=./packages/e2e test:e2e`;
    } else {
      await run('takaro', 'npm run test:ci', { ...composeOpts, NODE_ENV: 'test', LOGGING_LEVEL: 'none' });
    }
    logTiming('test_execution', phaseStart);
  } catch (error) {
    logTiming('test_execution', phaseStart);
    console.error('Tests failed');
    failed = true;
  }

  phaseStart = Date.now();
  await $`TAKARO_HOST=http://127.0.0.1:13000 npm -w packages/lib-apiclient run generate && npm run test:style:fix`;
  logTiming('api_client_generation', phaseStart);

  const logsResult = await logs(['takaro_api', 'takaro_mock_gameserver', 'takaro_connector', 'kratos'], {
    ...composeOpts,
    log: false,
  });

  await writeFile('./reports/integrationTests/docker-logs.txt', logsResult.out);
  await writeFile('./reports/integrationTests/docker-logs-err.txt', logsResult.err);

  phaseStart = Date.now();
  await cleanUp();
  logTiming('final_cleanup', phaseStart);

  logTiming('total_ci_duration', mainStart);

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
