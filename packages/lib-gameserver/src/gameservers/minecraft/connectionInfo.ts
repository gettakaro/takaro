import { IsBoolean, IsString } from 'class-validator';
import { TakaroDTO } from '@takaro/util';

export class MinecraftConnectionInfo extends TakaroDTO<MinecraftConnectionInfo> {
  @IsString()
  public host: string;
  @IsString()
  public password: string;
  @IsBoolean()
  public readonly useTls: boolean;
}

export const mockJsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'MinecraftConnectionInfo',
  type: 'object',
  properties: {
    host: {
      type: 'string',
    },
    password: {
      type: 'string',
    },
    useTls: {
      type: 'boolean',
      default: false,
    },
  },
  required: ['host', 'password'],
};
