import { upOne, upMany, logs, exec } from 'docker-compose';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const composeOpts = { log: true, composeOptions: ['-f', 'docker-compose.test.yml'], env: { ...process.env } };

async function main() {
  // First, start the datastores
  await upMany(['postgresql', 'redis', 'postgresql_kratos', 'postgresql_hydra'], composeOpts);

  // Then, start supporting services
  await upMany(['kratos', 'hydra', 'kratos-migrate', 'hydra-migrate'], composeOpts);

  // Check if ADMIN_CLIENT_ID and ADMIN_CLIENT_SECRET are set already
  // If not set, create them
  if (!composeOpts.env.ADMIN_CLIENT_ID || !composeOpts.env.ADMIN_CLIENT_SECRET) {
    await sleep(5000);
    const rawClientOutput = await exec('hydra', 'hydra -e http://localhost:4445  create client --grant-type client_credentials --format json', composeOpts);
    const parsedClientOutput = JSON.parse(rawClientOutput.out);

    console.log('Created OAuth admin client', { clientId: parsedClientOutput.client_id });
    composeOpts.env.ADMIN_CLIENT_ID = parsedClientOutput.client_id;
    composeOpts.env.ADMIN_CLIENT_SECRET = parsedClientOutput.client_secret;
  }

  await upOne('takaro', composeOpts);

  let failed = false;

  try {
    await exec('takaro', 'npm test', composeOpts);
  } catch (error) {
    console.error('Tests failed');
    console.error(error);
    failed = true;
  }

  await logs(['postgresql', 'redis', 'takaro'], composeOpts);

  if (failed) {
    process.exit(1);
  }
}


main()
  .then(res => {
    console.log(res);
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });

