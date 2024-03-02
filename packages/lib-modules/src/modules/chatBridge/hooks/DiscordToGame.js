import { takaro, data } from '@takaro/helpers';

async function main() {
  try {
    if (data.eventData.author.isBot) return;

    await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
      message: `[D] ${data.eventData.author.displayName}:  ${data.eventData.msg}`,
    });
  } catch (error) {
    console.error(error);
    await takaro.discordControllerSendMessage(data.discordChannelId, {
      message: 'Failed to forward your message to the game. Please try again later.',
    });
  }
}

await main();
