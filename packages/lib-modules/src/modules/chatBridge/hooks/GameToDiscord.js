import { takaro, data } from '@takaro/helpers';

async function main() {
  const discordChannel = data.module.systemConfig.hooks['DiscordToGame Discord channel ID'];

  const sender = data.player ? data.player.name : 'Non-player';
  const message = `**${sender}**: ${data.eventData.msg}`;

  await takaro.discord.discordControllerSendMessage(discordChannel, {
    message: message,
  });
}

await main();
