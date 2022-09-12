import { upOne, upMany, logs, exec } from 'docker-compose';

const composeOpts = { log: true, composeOptions: ['-f', 'docker-compose.yml'] };

async function main() {
  // First, start the datastores
  await upMany(['postgresql', 'redis'], composeOpts);


  // Once all data stores are initialized, we can start the app itself
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

