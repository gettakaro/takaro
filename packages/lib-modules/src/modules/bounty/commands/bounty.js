import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const { player, module: mod, arguments: args, gameServerId } = data;
  const takaro = await getTakaro(data);
  const currencyName = (await takaro.settings.settingsControllerGetOne('currencyName', gameServerId)).data.data;
  const targetPlayerName = (await takaro.player.playerControllerGetOne(args.target.playerId)).data.data.name;

  // check if you already have a bounty on the player
  const v = await takaro.variable.variableControllerSearch({
    filters: {
      key: ['bounty'],
      moduleId: [mod.moduleId],
      playerId: [player.playerId],
      gameServerId: [gameServerId],
    },
  });

  // check if you have a bounty on the target player
  const hasBountyOnTarget = v.data.data.some((v) => {
    const value = JSON.parse(v.value);
    return value.targetId === args.target.id;
  });

  if (hasBountyOnTarget) {
    await player.pm(`You already have a bounty set on ${targetPlayerName}`);
    return;
  }

  // take away the money from the player
  await takaro.playerOnGameserver.playerOnGameServerControllerDeductCurrency(player.id, { currency: args.amount });

  await takaro.variable.variableControllerCreate({
    key: 'bounty',
    value: JSON.stringify({ amount: args.amount, targetId: args.target.id }),
    moduleId: mod.moduleId,
    playerId: player.playerId,
    gameServerId,
  });

  await player.pm(`set bounty of ${args.amount} ${currencyName} on ${targetPlayerName}`);
}

await main();
