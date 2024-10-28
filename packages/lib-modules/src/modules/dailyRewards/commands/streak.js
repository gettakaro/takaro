import { data } from '@takaro/helpers';
import { getPlayerStreak, getLastClaim, getMultiplier } from './utils.js';

async function main() {
  const { pog, gameServerId, module: mod } = data;

  const streak = await getPlayerStreak(gameServerId, pog.playerId, mod.moduleId);
  const lastClaim = await getLastClaim(gameServerId, pog.playerId, mod.moduleId);
  const multiplier = await getMultiplier(pog);

  if (!streak || !lastClaim) {
    // eslint-disable-next-line quotes
    await pog.pm("You haven't claimed any daily rewards yet! Use /daily to get started.");
    return;
  }

  const nextClaimTime = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000);
  const now = new Date();
  const canClaim = now >= nextClaimTime;

  // Find next milestone
  let nextMilestone = null;
  for (const milestone of mod.userConfig.milestoneRewards) {
    if (milestone.days > streak) {
      nextMilestone = milestone;
      break;
    }
  }

  let message = `Current streak: ${streak} days${multiplier > 1 ? ` (${multiplier}x donor bonus!)` : ''}\n`;
  message += canClaim
    ? 'Your daily reward is available! Use /daily to claim it!\n'
    : `Next reward available at: ${nextClaimTime.toLocaleString()}\n`;

  if (nextMilestone) {
    message += `\n🎯 Next milestone: ${nextMilestone.days} days (${nextMilestone.days - streak} days to go!)`;
  }

  await pog.pm(message);
}

await main();
