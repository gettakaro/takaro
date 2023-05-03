import { IsString, IsBoolean } from 'class-validator';
import { TakaroDTO } from '@takaro/util';

export class SdtdConnectionInfo extends TakaroDTO<SdtdConnectionInfo> {
  @IsString()
  public readonly host!: string;
  @IsString()
  public readonly adminUser!: string;
  @IsString()
  public readonly adminToken!: string;
  @IsBoolean()
  public readonly useTls!: boolean;
}
