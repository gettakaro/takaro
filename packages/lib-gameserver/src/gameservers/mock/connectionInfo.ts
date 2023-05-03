import { IsString, IsNumber } from 'class-validator';
import { TakaroDTO } from '@takaro/util';

export class MockConnectionInfo extends TakaroDTO<MockConnectionInfo> {
  @IsString()
  public readonly host!: string;

  @IsNumber()
  public readonly eventInterval = 10000;
  public readonly playerPoolSize = 100;
}
