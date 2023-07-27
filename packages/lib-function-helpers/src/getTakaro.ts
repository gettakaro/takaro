import { Client } from '@takaro/apiclient';

export async function getTakaro(data: Record<string, any>): Promise<Client> {
  const takaro = new Client({
    url: data.url,
    auth: {
      token: data.token,
    },
  });

  if (data.player) {
    const sendPmToPlayer = async (message: string) => {
      return takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
        message,
        opts: {
          recipient: {
            gameId: data.player.gameId,
          },
        },
      });
    };

    data.player.pm = sendPmToPlayer;
  }

  return takaro;
}
