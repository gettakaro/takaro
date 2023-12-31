import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const { player, module: mod, arguments: args, gameServerId } = data;
  const takaro = await getTakaro(data);
  const currencyName = (await takaro.settings.settingsControllerGetOne('currencyName', gameServerId)).data.data;

  // check if you already have a bounty on the player
  const bountyVariable = await takaro.variable.variableControllerSearch({
    filters: {
      key: ['bounty'],
      moduleId: [mod.moduleId],
      gameServerId: [gameServerId],
    },
  });

  // check if you have a bounty on the target player
  const bountiesOnTarget = bountyVariable.data.data.filter((v) => {
    const value = JSON.parse(v.value);
    if (value.targetId === args.target.id) {
      return true;
    }
  });

  const targetName = (await takaro.player.playerControllerGetOne(args.target.playerId)).data.data.name;

  if (bountiesOnTarget.length === 0) {
    await player.pm(`there are currently no bounties set on ${targetName}`);
    return;
  }

  // total amount of bounties on target
  const amount = bountiesOnTarget.reduce((acc, curr) => {
    return acc + JSON.parse(curr.value).amount;
  }, 0);

  await player.pm(`${targetName} has a total bounty of ${amount} ${currencyName}`);
  return;
}

await main();
