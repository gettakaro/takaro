import { IsString, IsNumber, IsBoolean } from 'class-validator';
import { TakaroDTO } from '@takaro/util';

export class RustConnectionInfo extends TakaroDTO<RustConnectionInfo> {
  @IsString()
  public readonly host!: string;
  @IsNumber()
  public readonly rconPort!: string;
  @IsString()
  public readonly rconPassword!: string;
  @IsBoolean()
  public readonly useTls!: boolean;
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
    useTls: {
      type: 'boolean',
      default: false,
    },
  },
  required: ['host', 'rconPort', 'rconPassword', 'useTls'],
};
