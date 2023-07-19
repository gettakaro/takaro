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
  @IsBoolean()
  public readonly useCPM!: boolean;
}

export const sdtdJsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'SdtdConnectionInfo',
  type: 'object',
  properties: {
    host: {
      type: 'string',
    },
    adminUser: {
      type: 'string',
    },
    adminToken: {
      type: 'string',
    },
    useTls: {
      type: 'boolean',
    },
    useCPM: {
      type: 'boolean',
      default: false,
    },
  },
  required: ['host', 'adminUser', 'adminToken', 'useTls'],
};
