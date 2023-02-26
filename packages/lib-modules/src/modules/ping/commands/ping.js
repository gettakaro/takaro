async function ping() {
  await client.gameserver.gameServerControllerExecuteCommand(gameServerId, {
    command: 'say "Pong!"',
  });
}

ping();
