import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const discordChannel =
    data.module.systemConfig.hooks['DiscordToGame Discord channel ID'];

  const previouslySentMessagesRes =
    await takaro.variable.variableControllerFind({
      search: {
        key: 't_chatBridge_previouslySentMessages',
      },
      sortBy: 'key',
      sortDirection: 'asc',
    });

  const previouslySentMessages = previouslySentMessagesRes.data.data ?? [];

  const messageAlreadyHandled = previouslySentMessages.find((variable) => {
    return variable.value === data.msg;
  });

  if (messageAlreadyHandled) {
    console.log(
      'Message already handled, skipping to avoid duplicated messages.'
    );
    return;
  }

  const sender = data.player ? data.player.name : 'Non-player';
  const message = `**${sender}**: ${data.msg}`;

  await takaro.discord.discordControllerSendMessage(discordChannel, {
    message: message,
  });

  await takaro.variable.variableControllerCreate({
    key: `t_chatBridge_previouslySentMessages_${Date.now()}`,
    value: data.msg,
  });
}

main();
