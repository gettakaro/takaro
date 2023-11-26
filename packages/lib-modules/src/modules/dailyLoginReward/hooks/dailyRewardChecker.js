import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const { player, gameServerId, module: mod, playerOnGameServer } = data;
  const takaro = await getTakaro(data);

  const v = (
    await takaro.variable.variableControllerSearch({
      search: {
        key: 'dailyReward',
      },
      filters: {
        gameServerId: [gameServerId],
        playerId: [player.playerId],
        moduleId: [mod.moduleId],
      },
    })
  ).data.data;

  // First time login
  if (v.length === 0) {
    await takaro.variable.variableControllerCreate({
      gameServerId: gameServerId,
      player: player.playerId,
      moduleId: mod.moduleId,
      key: 'dailyReward',
      value: JSON.stringify({
        lastLogin: new Date().toISOString(),
        consecutiveDays: 1,
      }),
    });

    // give reward
    takaro.playerOnGameserver.playerOnGameServerControllerSetCurrency(playerOnGameServer, {
      currency: player.currency + calculateReward(1, mod),
    });
  } else {
    const value = JSON.parse(v[0].value);
    const lastLogin = new Date(value.lastLogin);
    let consecutiveDays = value.consecutiveDays;
    const now = new Date();

    // Reset the hours, minutes, seconds, and milliseconds for both dates
    lastLogin.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    // Calculate the difference in days
    const differenceInTime = now.getTime() - lastLogin.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    differenceInDays === 1 ? consecutiveDays++ : (consecutiveDays = 1);

    await takaro.variable.variableControllerUpdate(v[0].id, {
      value: JSON.stringify({
        lastLogin: new Date().toISOString(),
        consecutiveDays: consecutiveDays,
      }),
    });

    // get player currency and add reward
    takaro.playerOnGameserver.playerOnGameServerControllerSetCurrency(playerOnGameServer, {
      currency: player.currency + calculateReward(consecutiveDays, mod),
    });

    if (consecutiveDays > 30) {
      await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
        message: `Wow, ${player.name} has logged in for ${consecutiveDays} days in a row!`,
      });
    }
  }
}

const calculateReward = (consecutiveDays, mod) => {
  return Math.min(mod.userConfig.maxReward, mod.userConfig.initialReward * mod.userConfig.multiplier * consecutiveDays);
};

await main();
