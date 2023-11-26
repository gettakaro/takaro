import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const { player, module: mod, gameServerId } = data;
  const takaro = await getTakaro(data);
  const currencyName = (await takaro.settings.settingsControllerGetOne('currencyName', gameServerId)).data.data;

  // check if you already have a bounty on the player
  const bounties = await takaro.variable.variableControllerSearch({
    filters: {
      key: ['bounty'],
      moduleId: [mod.id],
      gameServerId: [gameServerId],
    },
  });

  const bountySums = bounties.reduce((acc, bounty) => {
    const bountyValue = JSON.parse(bounty.value);
    acc[bountyValue.target.id] = (acc[bountyValue.target.id] || 0) + bountyValue.amount;
    return acc;
  });

  const bountyPerTarget = Object.entries(bountySums).map(([target, total]) => ({
    target,
    total,
  }));

  const topBounties = bountyPerTarget.sort((a, b) => b.total - a.total).slice(0, Math.min(10, summedBounties.length));

  player.pm('Top 10 bounties:');
  for (let i = 0; i < topBounties.length; i++) {
    const targetName = (await takaro.player.playerControllerGetOne(topBounties[i].target)).data.data.name;
    await player.pm(`${i + 1}. ${targetName} - ${topBounties[i].total} ${currencyName}`);
  }

  return;
}

await main();
