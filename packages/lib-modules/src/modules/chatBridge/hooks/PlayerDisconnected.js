import { takaro, data } from '@takaro/helpers';

async function main() {
  const discordChannel = data.module.systemConfig.hooks['DiscordToGame'].discordChannelId;

  await takaro.discord.discordControllerSendMessage(discordChannel, {
    message: `[👋 Disconnected]: ${data.player.name}`,
  });
}

await main();
