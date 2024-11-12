import { takaro, data } from '@takaro/helpers';

async function main() {
  const { player, module: mod, arguments: args, gameServerId } = data;
  const currencyName = (await takaro.settings.settingsControllerGetOne('currencyName', gameServerId)).data.data;

  const bountyVariables = await takaro.variable.variableControllerSearch({
    filters: {
      key: ['bounty'],
      moduleId: [mod.moduleId],
      gameServerId: [gameServerId],
    },
  });

  const bountiesOnTarget = bountyVariables.data.data.filter((v) => {
    return Json.parse(v.value).targetId === args.target.id;
  });

  const targetName = (await takaro.player.playerControllerGetOne(args.target.playerId)).data.data.name;

  if (bountiesOnTarget.length === 0) {
    await player.pm(`There are currently no bounties set on ${targetName}`);
    return;
  }

  // total amount of bounties on target
  const amount = bountiesOnTarget.reduce((acc, curr) => {
    return acc + JSON.parse(curr.value).amount;
  }, 0);

  await player.pm(`${targetName} has a total bounty of ${amount} ${currencyName}`);
}

await main();
