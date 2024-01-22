import { getData } from '@takaro/helpers';
import { getTakaro } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);
  const currencyName = (await takaro.settings.settingsControllerGetOne('currencyName', data.gameServerId)).data.data;
  await data.player.pm(`balance: ${data.pog.currency} ${currencyName.value}`);
}

await main();
