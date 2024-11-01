import { takaro, data } from '@takaro/helpers';
import { STREAK_KEY } from './utils.js';

async function main() {
  const { pog, gameServerId, module: mod, arguments: args } = data;

  // Limit count to reasonable number
  const count = Math.min(Math.max(1, args.count), 50);

  // Get all streaks
  const streaksRes = await takaro.variable.variableControllerSearch({
    filters: {
      key: [STREAK_KEY],
      gameServerId: [gameServerId],
      moduleId: [mod.moduleId],
    },
    limit: 1000, // Get all possible streaks
  });

  if (streaksRes.data.data.length === 0) {
    await pog.pm('No players have started their daily streak yet!');
    return;
  }

  // Sort by streak value
  const sortedStreaks = streaksRes.data.data
    .map((record) => ({
      playerId: record.playerId,
      streak: JSON.parse(record.value),
    }))
    .sort((a, b) => b.streak - a.streak)
    .slice(0, count);

  // Get player names
  const playerDetails = await Promise.all(
    sortedStreaks.map(async (record) => {
      const player = (await takaro.player.playerControllerGetOne(record.playerId)).data.data;
      return {
        name: player.name,
        streak: record.streak,
      };
    }),
  );

  // Build message
  let message = `Top ${count} Daily Streaks:\n\n`;
  playerDetails.forEach((player, index) => {
    message += `${index + 1}. ${player.name}: ${player.streak} days\n`;
  });

  await pog.pm(message);
}

await main();
