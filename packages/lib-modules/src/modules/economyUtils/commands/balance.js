import { takaro, data } from '@takaro/helpers';

async function main() {
  const currencyName = (await takaro.settings.settingsControllerGetOne('currencyName', data.gameServerId)).data.data;
  await data.player.pm(`balance: ${data.pog.currency} ${currencyName.value}`);
}

await main();
