import { IGamePlayer } from '@takaro/gameserver';

export async function getMockPlayer(
  extra: Partial<IGamePlayer> = {}
): Promise<IGamePlayer> {
  const data: Partial<IGamePlayer> = {
    gameId: 'mock-gameId',
    name: 'mock-player',
    ...extra,
  };

  return new IGamePlayer().construct(data);
}
