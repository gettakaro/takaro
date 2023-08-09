import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  try {
    const data = await getData();
    const takaro = await getTakaro(data);

    if (data.eventData.author.isBot) return;

    await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
      message: `[D] ${data.eventData.author.displayName}:  ${data.eventData.msg}`,
    });
  } catch (error) {
    await takaro.discordControllerSendMessage(data.discordChannelId, {
      message: `Failed to forward your message to the game due to an error: ${error.message}`,
    });
  }
}

await main();