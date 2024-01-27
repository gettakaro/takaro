import { Client } from '@takaro/apiclient';

export async function getTakaro(
  data: Record<string, any>,
  logger?: Pick<Console, 'log' | 'debug' | 'error' | 'warn' | 'info'>
): Promise<Client> {
  const takaro = new Client({
    url: data.url,
    auth: {
      token: data.token,
    },
    log: logger ? logger : console,
  });

  if (data.pog) {
    const sendPmToPlayer = async (message: string) => {
      return takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
        message,
        opts: {
          recipient: {
            gameId: data.pog.gameId,
          },
        },
      });
    };

    data.pog.pm = sendPmToPlayer;

    if (data.player) {
      data.player.pm = sendPmToPlayer;
    }
  }

  return takaro;
}
