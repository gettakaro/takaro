import { IGamePlayer, IGameServer } from '../interfaces';

export class SevenDaysToDie implements IGameServer {
  async getPlayers(): Promise<IGamePlayer[]> {
    return [];
  }
}
