import { upMany, logs, exec } from 'docker-compose';
import net from 'net';

const composeOpts = { log: true };

async function main() {
  // First, start the datastores
  await upMany(['postgresql', 'redis'], composeOpts);

  await Promise.all([
    waitForPort(5432),
    waitForPort(6379),
  ]);

  // Once all data stores are initialized, we can start the app itself
  await upMany(['takaro'], composeOpts);

  await waitForPort(13000);

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

async function waitForPort(port, timeout = 60) {
  const start = Date.now();
  let tries = 0;
  while (Date.now() - start < timeout * 1000) {
    tries++;
    console.log(`Waiting for port ${port} to be available, try ${tries}`);
    try {
      await net.connect(port);
      return;
    } catch (e) {
      await wait(1);
    }
  }
  throw new Error(`Timed out waiting for port ${port} to be available`);
}

function wait(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function countdown(seconds) {
  if (seconds === 0) { return; }

  console.log(seconds);
  await wait(1);
  return countdown(seconds - 1);
}