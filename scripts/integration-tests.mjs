import { upMany, logs, exec } from 'docker-compose';

const composeOpts = { log: true };

async function main() {
  // First, start the datastores
  await upMany(['postgresql', 'redis'], composeOpts);

  console.log('Waiting 30 seconds for datastores');
  await countdown(30);

  // Once all data stores are initialized, we can start the app itself
  await upMany(['takaro'], composeOpts);

  console.log('Waiting 30 seconds for app to start');
  await countdown(30);

  await exec('takaro', 'npm run test', composeOpts);

  await logs(['postgresql', 'redis', 'takaro'], composeOpts);
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