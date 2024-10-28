import { data } from '@takaro/helpers';
import { getLastClaim } from './utils.js';

async function main() {
  const { pog, gameServerId, module: mod } = data;

  const lastClaim = await getLastClaim(gameServerId, pog.playerId, mod.moduleId);

  // First time player
  if (!lastClaim) {
    await pog.pm('👋 Welcome! Use /daily to claim your first daily reward and start your streak!');
    return;
  }

  const now = new Date();
  const nextClaimTime = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000);

  if (now >= nextClaimTime) {
    await pog.pm('🎁 Your daily reward is ready! Use /daily to claim it!');
  }
}

await main();
