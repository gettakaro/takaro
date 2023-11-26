import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const _takaro = await getTakaro(data);

  // TODO: make sure to check that the bounty is not resolved if the player kills himself
  // or gets killed by an admin (through a command) or gets killed by an entity in the game
}

await main();
