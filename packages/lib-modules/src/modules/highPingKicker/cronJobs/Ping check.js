import { takaro, data } from '@takaro/helpers';

const VARIABLE_KEY = 'highPingKicker:warnings';

async function main() {
  const currentPlayers = await takaro.gameserver.gameServerControllerGetPlayers(data.gameServerId);

  await Promise.all(
    currentPlayers.data.data.map(async (player) => {
      if (player.ping > data.module.userConfig.pingThreshold) {
        const takaroPlayerRes = await takaro.player.playerControllerSearch({
          filters: {
            steamId: player.steamId,
          },
        });

        const takaroPlayer = takaroPlayerRes.data.data[0];

        const currentWarningsRes = await takaro.variable.variableControllerFind({
          filters: {
            playerId: takaroPlayer.id,
            key: VARIABLE_KEY,
          },
        });

        const currentWarningsRecords = currentWarningsRes.data.data;

        let currentWarnings = 1;
        if (!currentWarningsRecords.length) {
          await takaro.variable.variableControllerCreate({
            playerId: takaroPlayer.id,
            key: VARIABLE_KEY,
            value: '1',
          });
        } else {
          currentWarnings = parseInt(currentWarningsRecords[0].value, 10);
        }

        if (currentWarningsRecords.length === 1) {
          await takaro.variable.variableControllerUpdate(currentWarningsRecords[0].id, {
            value: (currentWarnings + 1).toString(),
          });

          await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
            message: `Your ping (${player.ping}) is too high. Warning ${currentWarnings}/${data.module.userConfig.warningsBeforeKick}`,
            opts: {
              recipient: {
                gameId: player.gameId,
              },
            },
          });
        }

        if (currentWarnings >= data.module.userConfig.warningsBeforeKick) {
          await takaro.gameserver.gameServerControllerKickPlayer(data.gameServerId, takaroPlayer.id, {
            reason: `Your ping (${player.ping}) is too high, please try again later.`,
          });

          await takaro.variable.variableControllerDelete(currentWarningsRecords[0].id);
        }
      }
    })
  );
}

await main();
