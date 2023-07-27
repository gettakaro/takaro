import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const takaro = await getTakaro(data);
  await data.player.pm('Pong!');
}

await main();
