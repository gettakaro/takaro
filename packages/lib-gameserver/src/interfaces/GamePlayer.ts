import { IsString } from 'class-validator';

export class IGamePlayer {
  /**
   * Unique identifier for this player, as used by the game
   */
  @IsString()
  platformId!: string;
  /**
   * The players username
   */
  @IsString()
  name!: string;
}
