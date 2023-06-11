import { IsOptional, IsString } from 'class-validator';
import { TakaroDTO } from '@takaro/util';

export class IGamePlayer extends TakaroDTO<IGamePlayer> {
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

  @IsString()
  @IsOptional()
  platformId?: string;

  @IsString()
  @IsOptional()
  ip?: string;
}
