import { data, takaro, checkPermission } from '@takaro/helpers';

const VARIABLE_KEY = 'lastZombieKillReward';

async function main() {
  const { gameServerId, module: mod } = data;

  const lastRunRes = (
    await takaro.variable.variableControllerSearch({
      filters: {
        key: [VARIABLE_KEY],
        gameServerId: [gameServerId],
        moduleId: [mod.moduleId],
      },
    })
  ).data.data;

  // We last ran the rewards script at this time
  // If this is the first time we run it, just get the last 5 minutes
  const lastRun = lastRunRes.length ? new Date(JSON.parse(lastRunRes[0].value)) : new Date(Date.now() - 5 * 60 * 1000);

  // Fetch all the kill events since the last time we gave out rewards
  const killEvents = (
    await takaro.event.eventControllerSearch({
      filters: { eventName: ['entity-killed'], gameserverId: [gameServerId] },
      greaterThan: { createdAt: lastRun.toISOString() },
      limit: 1000,
    })
  ).data.data;

  console.log(`Found ${killEvents.length} kill events since ${lastRun.toISOString()}`);

  // Group the events by player
  const playerKills = {};
  for (const killEvent of killEvents) {
    if (!playerKills[killEvent.playerId]) {
      playerKills[killEvent.playerId] = [];
    }

    playerKills[killEvent.playerId].push(killEvent);
  }

  // Give each player their reward
  // We use Promise.allSettled to run this concurrently
  const results = await Promise.allSettled(
    Object.entries(playerKills).map(async ([playerId, kills]) => {
      const pog = (await takaro.playerOnGameserver.playerOnGameServerControllerGetOne(gameServerId, playerId)).data
        .data;
      const hasPermission = checkPermission(pog, 'ZOMBIE_KILL_REWARD_OVERRIDE');
      const defaultReward = mod.userConfig.zombieKillReward;
      const reward = hasPermission && hasPermission.count != null ? hasPermission.count : defaultReward;
      const totalReward = reward * kills.length;
      return takaro.playerOnGameserver.playerOnGameServerControllerAddCurrency(gameServerId, playerId, {
        currency: totalReward,
      });
    }),
  );

  // Log any errors
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error(result.reason);
      throw new Error(`Failed to give rewards: ${result.reason}`);
    }
  }

  // Update the last run time
  if (lastRunRes.length) {
    await takaro.variable.variableControllerUpdate(lastRunRes[0].id, {
      value: JSON.stringify(new Date()),
    });
  } else {
    await takaro.variable.variableControllerCreate({
      key: VARIABLE_KEY,
      value: JSON.stringify(new Date()),
      moduleId: mod.moduleId,
      gameServerId,
    });
  }
}

await main();
