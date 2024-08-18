import { takaro, data, TakaroUserError } from '@takaro/helpers';

async function main() {
  const { user, player, arguments: args, _gameServerId } = data;

  if (!user) throw new TakaroUserError('You must link your account to Takaro to use this command.');

  const pendingOrdersRes = await takaro.shopOrder.shopOrderControllerSearch({
    filters: {
      userId: [user.id],
      status: ['PAID'],
    },
    sortBy: 'createdAt',
    sortDirection: 'asc',
  });

  if (pendingOrdersRes.data.data.length === 0) {
    await player.pm('You have no pending orders.');
    return;
  }

  let ordersToClaim = [];

  if (args.all) {
    ordersToClaim = pendingOrdersRes.data.data;
  } else {
    ordersToClaim.push(pendingOrdersRes.data.data[0]);
  }

  for (const order of ordersToClaim) {
    await takaro.shopOrder.shopOrderControllerClaim(order.id);
  }
}

await main();
