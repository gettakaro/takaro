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
  const bountyVar = v.data.data.find((v) => {
    const value = JSON.parse(v.value);
    if (value.target === args.target) {
      return true;
    }
  });

  const targetName = (await takaro.player.playerControllerGetOne(args.target.playerId)).data.data.name;
  const playerName = (await takaro.player.playerControllerGetOne(player.playerId)).data.data.name;

  if (bountyVar) {
    const amount = JSON.parse(bountyVar.value).amount;
    await takaro.variable.variableControllerDelete(bountyVar.id);
    await takaro.playerOnGameserver.playerOnGameServerControllerAddCurrency(player.id, { currency: amount });
    await player.pm(`Bounty on ${targetName} has been removed and you have been refunded ${amount} ${currencyName}`);

    takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
      message: `${playerName} removed Bounty of ${amount} ${currencyName} on ${targetName}.`,
    });
    return;
  }

  await player.pm(`You do not have a bounty set on ${targetName}`);
}

await main();
