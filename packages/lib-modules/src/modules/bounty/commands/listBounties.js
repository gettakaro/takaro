import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const { player, module: mod, gameServerId } = data;
  const takaro = await getTakaro(data);
  const currencyName = (await takaro.settings.settingsControllerGetOne('currencyName', gameServerId)).data.data;

  // check if you already have a bounty on the player
  const bounties = (
    await takaro.variable.variableControllerSearch({
      filters: {
        key: ['bounty'],
        moduleId: [mod.moduleId],
        gameServerId: [gameServerId],
      },
    })
  ).data.data;

  const bountySumsMap = bounties.reduce((acc, bounty) => {
    const bountyValue = JSON.parse(bounty.value);
    const targetId = bountyValue.targetId;
    const amount = bountyValue.amount;

    if (acc.has(targetId)) {
      // If an entry for this targetId already exists, update its total
      acc.set(targetId, acc.get(targetId) + amount);
    } else {
      // Otherwise, add a new entry to the map
      acc.set(targetId, amount);
    }
    return acc;
  }, new Map());

  // Convert the Map into the desired array of objects
  const bountySums = Array.from(bountySumsMap, ([targetId, total]) => ({ targetId, total }));

  // order by total
  const topBounties = bountySums.sort((a, b) => b.total - a.total).slice(0, Math.min(10, bountySums.length));

  if (topBounties.length === 0) {
    await player.pm('There are no bounties set.');
    return;
  }

  player.pm('Top 10 bounties:');
  for (let i = 0; i < topBounties.length; i++) {
    const targetName = (await takaro.player.playerControllerGetOne(topBounties[i].target)).data.data.name;
    await player.pm(`${i + 1}. ${targetName} - ${topBounties[i].total} ${currencyName}`);
  }

  return;
}

await main();
