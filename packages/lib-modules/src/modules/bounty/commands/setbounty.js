import { takaro, data, TakaroUserError } from '@takaro/helpers';
import { findBounty } from 'utils.js';

async function main() {
  const { player, module: mod, arguments: args, gameServerId } = data;

  const bounty = await findBounty(gameServerId, mod.moduleId, player.playerId, args.target.id);
  if (bounty === undefined) {
    throw new TakaroUserError('You already have a bounty set on this player.');
  }

  await takaro.playerOnGameserver.playerOnGameServerControllerDeductCurrency(player.id, {
    currency: args.amount,
  });

  await takaro.variable.variableControllerCreate({
    key: 'bounty',
    value: JSON.stringify({
      amount: args.amount,
      targetId: args.target.id,
    }),
    moduleId: mod.moduleId,
    playerId: player.playerId,
    gameServerId,
  });

  await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
    message: `${setterPlayerName} set bounty of ${args.amount} ${currencyName} on ${targetPlayerName}`,
  });
}

await main();
