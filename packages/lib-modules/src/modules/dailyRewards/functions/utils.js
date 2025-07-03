import { takaro, checkPermission } from '@takaro/helpers';

export const DAILY_KEY = 'daily_timestamp';
export const STREAK_KEY = 'daily_streak';

export async function getMultiplier(pog) {
  const perm = checkPermission(pog, 'DAILY_REWARD_MULTIPLIER');
  if (perm) return perm.count;
  return 1;
}

export async function getPlayerStreak(gameServerId, playerId, moduleId) {
  const streakRes = await takaro.variable.variableControllerSearch({
    filters: {
      key: [STREAK_KEY],
      gameServerId: [gameServerId],
      playerId: [playerId],
      moduleId: [moduleId],
    },
  });

  return streakRes.data.data.length ? parseInt(JSON.parse(streakRes.data.data[0].value)) : 0;
}

export async function getLastClaim(gameServerId, playerId, moduleId) {
  const lastClaimRes = await takaro.variable.variableControllerSearch({
    filters: {
      key: [DAILY_KEY],
      gameServerId: [gameServerId],
      playerId: [playerId],
      moduleId: [moduleId],
    },
  });

  return lastClaimRes.data.data.length ? new Date(JSON.parse(lastClaimRes.data.data[0].value)) : null;
}
