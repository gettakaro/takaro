import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const previouslySentMessagesRes =
    await takaro.variable.variableControllerFind({
      search: {
        key: 't_chatBridge_previouslySentMessages',
      },
      filters: {
        gameServerId: data.gameServerId,
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

  await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
    message: `[Discord] ${data.msg}`,
  });

  await takaro.variable.variableControllerCreate({
    key: `t_chatBridge_previouslySentMessages_${Date.now()}`,
    value: data.msg,
    gameServerId: data.gameServerId,
  });
}

main();
