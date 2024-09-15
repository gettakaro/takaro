import { data, takaro } from '@takaro/helpers';

async function main() {
  const { module: mod, gameServerId } = data;

  // Check what the last message we sent was
  const lastMessageVar = (
    await takaro.variable.variableControllerSearch({
      filters: {
        key: ['lastMessage'],
        moduleId: [mod.moduleId],
        gameServerId: [gameServerId],
      },
    })
  ).data.data[0];

  // If we haven't sent any messages yet, start with the first one
  const lastMessage = lastMessageVar ? parseInt(lastMessageVar.value, 10) : -1;
  // The next message we should send is the next in the array
  // However, if we're at the end of the array, we should start over
  const nextMessage = data.module.userConfig.messages[lastMessage + 1] ? lastMessage + 1 : 0;
  // The actual text of the message we're going to send
  const messageToSend = data.module.userConfig.messages[nextMessage];

  // Send the message to the game server
  await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
    message: messageToSend,
  });

  // Update the last message variable so the next time this cron job runs, we know what to send
  if (lastMessageVar) {
    // The variable already exists, update it
    await takaro.variable.variableControllerUpdate(lastMessageVar.id, {
      value: nextMessage.toString(),
    });
  } else {
    // The variable doesn't exist, create it
    await takaro.variable.variableControllerCreate({
      key: 'lastMessage',
      value: nextMessage.toString(),
      moduleId: mod.moduleId,
      gameServerId: gameServerId,
    });
  }
}

await main();
