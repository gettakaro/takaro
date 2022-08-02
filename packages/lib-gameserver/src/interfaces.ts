export interface IGamePlayer {
  /**
   * Unique identifier for this player, as used by the game
   */
  platformId: string;
  /**
   * The players username
   */
  name: string;
}

export interface IGameServer {
  getPlayers(): Promise<IGamePlayer[]>;
}
