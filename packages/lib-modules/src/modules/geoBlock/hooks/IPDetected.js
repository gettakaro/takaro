import { getTakaro, getData, checkPermission } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const { gameServerId, playerId, player } = data;
  const { country } = data.eventData;
  const { ban, banDuration, countries, message, mode } = data.module.userConfig;

  async function handleAction() {
    if (ban) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + banDuration * 1000);
      await takaro.gameserver.gameServerControllerBanPlayer(gameServerId, playerId, {
        reason: message,
        expiresAt,
      });
    } else {
      await takaro.gameserver.gameServerControllerKickPlayer(gameServerId, playerId, {
        reason: message,
      });
    }
  }

  const isImmune = checkPermission(player, 'GEOBLOCK_IMMUNITY');
  if (isImmune) {
    console.log('Player has immunity, no action');
    return;
  }

  if (mode === 'allow') {
    if (countries.includes(country)) {
      console.log('Allowed country detected, no action');
      return;
    } else {
      console.log('Blocked country detected, performing actions');
      await handleAction();
      return;
    }
  }

  if (mode === 'deny') {
    if (countries.includes(country)) {
      console.log('Blocked country detected, performing actions');
      await handleAction();
      return;
    } else {
      console.log('Allowed country detected, no action');
      return;
    }
  }
}

await main();
