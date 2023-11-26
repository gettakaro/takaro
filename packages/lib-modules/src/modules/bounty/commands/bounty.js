import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const { player, module: mod, arguments: args, gameServerId } = data;
  const takaro = await getTakaro(data);
  const currencyName = (await takaro.settings.settingsControllerGetOne('currencyName', gameServerId)).data.data;

  // check if you already have a bounty on the player
  const v = await takaro.variable.variableControllerSearch({
    filters: {
      key: ['bounty'],
      moduleId: [mod.id],
      playerId: [player.playerId],
      gameServerId: [gameServerId],
    },
  });

  // check if you have a bounty on the target player
  const hasBountyOnTarget = v.data.data.some((v) => {
    const value = JSON.parse(v.value);
    if (value.target.id === args.target.id) {
      return true;
    }
  });

  if (hasBountyOnTarget) {
    await player.pm(`You already have a bounty on ${args.target}`);
    return;
  }

  // take away the money from the player
  await takaro.playerOnGameserver.playerOnGameServerControllerDeductCurrency(player.id, { currency: args.amount });

  await takaro.variable.variableControllerCreate({
    key: 'bounty',
    value: JSON.stringify({ amount: args.amount, target: args.target }),
    moduleId: mod.id,
    playerId: player.playerId,
    gameServerId,
  });

  // get playerName
  const playerName = (await takaro.player.playerControllerGetOne(args.target.playerId)).data.data.name;
  await player.pm(`set bounty of ${args.amount} ${currencyName} on ${playerName}`);
}

await main();
