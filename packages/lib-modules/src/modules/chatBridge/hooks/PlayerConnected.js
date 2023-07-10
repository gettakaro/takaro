import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const discordChannel = data.module.systemConfig.hooks['DiscordToGame Discord channel ID'];

  await takaro.discord.discordControllerSendMessage(discordChannel, {
    message: `[🔌 Connected]: ${data.eventData.player.name}`,
  });
}

main();
