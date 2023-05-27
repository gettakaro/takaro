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

export const rustJsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'RustConnectionInfo',
  type: 'object',
  properties: {
    host: {
      type: 'string',
    },
    rconPort: {
      type: 'number',
    },
    rconPassword: {
      type: 'string',
    },
  },
  required: ['host', 'rconPort', 'rconPassword'],
};
