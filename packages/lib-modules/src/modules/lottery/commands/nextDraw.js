import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro();

  const { player } = data;

  const cronjob = await takaro.cronjob.cronJobControllerSearch({ filters: { name: ['drawLottery'] } });

  await player.pm(`${cronjob.data.data[0].temporalValue}`);
}

await main();
