import { IsString, IsNumber } from 'class-validator';
import { TakaroDTO } from '@takaro/util';

export class RustConnectionInfo extends TakaroDTO<RustConnectionInfo> {
  @IsString()
  public readonly host!: string;
  @IsNumber()
  public readonly rconPort!: string;
  @IsString()
  public readonly rconPassword!: string;
}
