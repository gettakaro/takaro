import { upOne, upMany, logs, exec } from 'docker-compose';

const composeOpts = { log: true, composeOptions: ['-f', 'docker-compose.yml'] };

async function main() {
  // First, start the datastores
  await upMany(['postgresql', 'redis'], composeOpts);

  console.log('Waiting 30 seconds for datastores');
  await countdown(30);

  // Once all data stores are initialized, we can start the app itself
  await upOne('takaro', composeOpts);

  console.log('Waiting 60 seconds for app to start');
  await countdown(60);

  let failed = false;

  try {
    await exec(['takaro'], 'npm test', composeOpts);
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

function wait(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function countdown(seconds) {
  if (seconds === 0) { return; }

  console.log(seconds);
  await wait(1);
  return countdown(seconds - 1);
}