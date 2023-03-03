async function ping() {
  await client.gameserver.gameServerControllerSendMessage(gameServerId, {
    message: 'Pong!',
    opts: {
      recipient: event.player,
    },
  });
}

ping();
