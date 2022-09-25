import { IsOptional, IsString } from 'class-validator';

export class IGamePlayer {
  /**
   * Unique identifier for this player, as used by the game
   */
  @IsString()
  gameId!: string;
  /**
   * The players username
   */
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  steamId?: string;

  @IsString()
  @IsOptional()
  epicOnlineServicesId?: string;

  @IsString()
  @IsOptional()
  xboxLiveId?: string;
}
