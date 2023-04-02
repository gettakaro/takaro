import { getTakaro, getData } from '@takaro/helpers';

async function tplist() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const player = data.player;

  const teleportsRes = await takaro.variable.variableControllerFind({
    search: {
      key: `t_tp_${data.gameServerId}_${player.gameId}`,
    },
    sortBy: 'key',
    sortDirection: 'asc',
  });

  if (teleportsRes.data.data.length === 0) {
    await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
      message: 'You have no teleports set, use /settp <name> to set one.',
    });
    return;
  }

  const teleports = teleportsRes.data.data;

  await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
    message: `You have ${teleports.length} teleport${
      teleports.length === 1 ? '' : 's'
    } set`,
  });

  for (const rawTeleport of teleports) {
    const teleport = JSON.parse(rawTeleport.value);
    await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
      message: ` - ${teleport.name}: ${teleport.x}, ${teleport.y}, ${teleport.z}`,
    });
  }
}

tplist();
