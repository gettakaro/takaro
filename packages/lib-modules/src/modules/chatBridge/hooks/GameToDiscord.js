import { takaro, data } from '@takaro/helpers';

async function main() {
  const onlyGlobal = data.module.userConfig.onlyGlobalChat;

  if (onlyGlobal && data.eventData.channel !== 'global') return;

  const discordChannel = data.module.systemConfig.hooks['DiscordToGame'].discordChannelId;

  const sender = data.player ? data.player.name : 'Non-player';
  const message = `**${sender}**: ${data.eventData.msg}`;

  await takaro.discord.discordControllerSendMessage(discordChannel, {
    message: message,
  });
}

await main();
