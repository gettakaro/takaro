import { takaro, data } from '@takaro/helpers';

async function main() {
  const richest = (
    await takaro.playerOnGameserver.playerOnGameServerControllerSearch({
      limit: 10,
      sortBy: 'currency',
      sortDirection: 'desc',
      extend: ['player'],
    })
  ).data.data;

  const currencyName = (await takaro.settings.settingsControllerGetOne('currencyName', data.gameServerId)).data.data
    .value;

  // TODO: change this to name when it become available in playerOnGameServer
  const richestStrings = richest.map(async (pog, index) => {
    const playerName = (await takaro.player.playerControllerGetOne(pog.playerId)).data.data.name;
    return `${index + 1}. ${playerName} - ${pog.currency} ${currencyName}`;
  });

  await data.player.pm('Richest players:');

  for (const string of richestStrings) {
    await data.player.pm(await string);
  }
}

await main();
