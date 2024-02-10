import { IsString } from 'class-validator';
import { TakaroDTO } from '@takaro/util';

export class MockConnectionInfo extends TakaroDTO<MockConnectionInfo> {
  @IsString()
  public readonly host!: string;
  @IsString()
  public readonly name!: string;
}

export const mockJsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'MockConnectionInfo',
  type: 'object',
  properties: {
    host: {
      type: 'string',
    },
    name: {
      type: 'string',
      default: 'mock',
    },
  },
  required: ['host'],
};
