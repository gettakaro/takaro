import { takaro, data } from '@takaro/helpers';
import { findBounty } from '../functions/utils.js';

async function main() {
  const { player, module: mod, arguments: args, gameServerId } = data;
  const currencyName = (await takaro.settings.settingsControllerGetOne('currencyName', gameServerId)).data.data;

  const bountyVariable = findBounty(gameServerId, mod.moduleId, player.playerId, args.target.id);
  if (bountyVariable === undefined) {
    throw new TakaroUserError('You do not have a bounty set on this player.');
  }

  const targetName = (await takaro.player.playerControllerGetOne(args.target.playerId)).data.data.name;
  const playerName = (await takaro.player.playerControllerGetOne(player.playerId)).data.data.name;

  const amount = JSON.parse(bountyVariable.value).amount;
  await takaro.variable.variableControllerDelete(bountyVariable.id);
  await takaro.playerOnGameserver.playerOnGameServerControllerAddCurrency(player.id, { currency: amount });
  await player.pm(`Bounty on ${targetName} has been removed and you have been refunded ${amount} ${currencyName}`);

  await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
    message: `${playerName} removed Bounty of ${amount} ${currencyName} on ${targetName}.`,
  });
}

await main();
