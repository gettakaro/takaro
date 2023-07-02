import { getTakaro, getData } from '@takaro/helpers';

async function tplist() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const { player, gameServerId } = data;

  const prefix = (
    await takaro.settings.settingsControllerGetOne(
      'commandPrefix',
      gameServerId
    )
  ).data.data;

  const teleportRes = await takaro.variable.variableControllerFind({
    filters: {
      gameServerId,
      playerId: player.id,
    },
    search: {
      key: 't_tp',
    },
    sortBy: 'key',
    sortDirection: 'asc',
  });

  const teleports = teleportRes.data.data;

  if (teleports.length === 0) {
    await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
      message: `You have no teleports set, use ${prefix}settp <name> to set one.`,
    });
    return;
  }

  await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
    message: `You have ${teleports.length} teleport${
      teleports.length === 1 ? '' : 's'
    } set`,
  });

  for (const rawTeleport of teleports) {
    const teleport = JSON.parse(rawTeleport.value);
    await takaro.gameserver.gameServerControllerSendMessage(gameServerId, {
      message: ` - ${teleport.name}: ${teleport.x}, ${teleport.y}, ${teleport.z}`,
    });
  }
}

tplist();
