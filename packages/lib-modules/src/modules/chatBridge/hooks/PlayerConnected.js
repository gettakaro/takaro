import { takaro, data } from '@takaro/helpers';

async function main() {
  const discordChannel = data.module.systemConfig.hooks['DiscordToGame Discord channel ID'];

  await takaro.discord.discordControllerSendMessage(discordChannel, {
    message: `[🔌 Connected]: ${data.player.name}`,
  });
}

await main();
