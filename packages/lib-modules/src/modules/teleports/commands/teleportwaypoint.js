import { takaro, data, TakaroUserError, checkPermission } from '@takaro/helpers';

function getWaypointName(name) {
  return `waypoint ${name}`;
}

async function main() {
  const { pog, gameServerId, trigger, module, itemId } = data;

  const triggeredCommand = module.version.commands.find((command) => command.id === itemId);

  if (!triggeredCommand) {
    throw new Error('Waypoint not found.');
  }

  if (!triggeredCommand.name.includes(`server ${gameServerId}`)) {
    console.log(`Waypoint ${trigger} is not for this server.`);
    return;
  }

  if (!checkPermission(pog, `WAYPOINTS_USE_${trigger.toUpperCase()}_${gameServerId}`)) {
    throw new TakaroUserError(`You are not allowed to use the waypoint ${trigger}.`);
  }

  const teleportsModule = (
    await takaro.module.moduleControllerSearch({
      filters: {
        builtin: ['teleports'],
      },
    })
  ).data.data[0];

  const variable = await takaro.variable.variableControllerSearch({
    filters: {
      key: [getWaypointName(trigger)],
      gameServerId: [gameServerId],
      moduleId: [teleportsModule.id],
    },
  });

  if (variable.data.data.length === 0) {
    throw new TakaroUserError(`Waypoint ${trigger} does not exist.`);
  }

  const waypoint = JSON.parse(variable.data.data[0].value);

  await takaro.gameserver.gameServerControllerTeleportPlayer(gameServerId, pog.playerId, {
    x: waypoint.x,
    y: waypoint.y,
    z: waypoint.z,
  });

  await pog.pm(`Teleported to waypoint ${trigger}.`);
}

await main();
