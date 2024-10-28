import { takaro, data, TakaroUserError, checkPermission } from '@takaro/helpers';
import { DAILY_KEY, STREAK_KEY, getMultiplier } from './utils.js';

async function main() {
  const { pog, gameServerId, module: mod } = data;

  if (!checkPermission(pog, 'DAILY_CLAIM')) {
    throw new TakaroUserError('You do not have permission to claim daily rewards.');
  }

  // Get last claim time
  const lastClaimRes = await takaro.variable.variableControllerSearch({
    filters: {
      key: [DAILY_KEY],
      gameServerId: [gameServerId],
      playerId: [pog.playerId],
      moduleId: [mod.moduleId],
    },
  });

  const now = new Date();
  let streak = 1;

  if (lastClaimRes.data.data.length > 0) {
    const lastClaim = new Date(JSON.parse(lastClaimRes.data.data[0].value));
    const hoursSinceLastClaim = (now - lastClaim) / (1000 * 60 * 60);

    // Check if 24 hours have passed
    if (hoursSinceLastClaim < 24) {
      const nextClaimTime = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000);
      throw new TakaroUserError(`You can claim your next reward at ${nextClaimTime.toLocaleString()}`);
    }

    // Get current streak
    const streakRes = await takaro.variable.variableControllerSearch({
      filters: {
        key: [STREAK_KEY],
        gameServerId: [gameServerId],
        playerId: [pog.playerId],
        moduleId: [mod.moduleId],
      },
    });

    if (streakRes.data.data.length > 0) {
      // If claimed within 48 hours, increment streak
      if (hoursSinceLastClaim < 48) {
        streak = Math.min(JSON.parse(streakRes.data.data[0].value) + 1, mod.userConfig.maxStreak);
        await takaro.variable.variableControllerUpdate(streakRes.data.data[0].id, {
          value: JSON.stringify(streak),
        });
      } else {
        // Reset streak if more than 48 hours
        await takaro.variable.variableControllerUpdate(streakRes.data.data[0].id, {
          value: JSON.stringify(1),
        });
      }
    } else {
      // Create new streak record
      await takaro.variable.variableControllerCreate({
        key: STREAK_KEY,
        value: JSON.stringify(1),
        gameServerId,
        playerId: pog.playerId,
        moduleId: mod.moduleId,
      });
    }

    // Update last claim time
    await takaro.variable.variableControllerUpdate(lastClaimRes.data.data[0].id, {
      value: JSON.stringify(now),
    });
  } else {
    // First time claim
    await takaro.variable.variableControllerCreate({
      key: DAILY_KEY,
      value: JSON.stringify(now),
      gameServerId,
      playerId: pog.playerId,
      moduleId: mod.moduleId,
    });
    await takaro.variable.variableControllerCreate({
      key: STREAK_KEY,
      value: JSON.stringify(1),
      gameServerId,
      playerId: pog.playerId,
      moduleId: mod.moduleId,
    });
  }

  const multiplier = await getMultiplier(pog);
  const baseReward = mod.userConfig.baseReward * streak * multiplier;
  let bonusReward = 0;
  let milestoneMessage = '';

  // Check for milestones
  for (const milestone of mod.userConfig.milestoneRewards) {
    if (streak === milestone.days) {
      bonusReward = milestone.reward;
      milestoneMessage = `\n${milestone.message}`;
      break;
    }
  }

  // Award total rewards
  const totalReward = baseReward + bonusReward;
  await takaro.playerOnGameserver.playerOnGameServerControllerAddCurrency(gameServerId, pog.playerId, {
    currency: totalReward,
  });

  const currencyName = (await takaro.settings.settingsControllerGetOne('currencyName', gameServerId)).data.data.value;
  await pog.pm(
    `Daily reward claimed! You received ${totalReward} ${currencyName}\n` +
      `Current streak: ${streak} days${multiplier > 1 ? ` (${multiplier}x bonus!)` : ''}` +
      milestoneMessage,
  );
}

await main();
