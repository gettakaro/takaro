import { IsString } from 'class-validator';
import { TakaroDTO } from '@takaro/util';

export class GenericConnectionInfo extends TakaroDTO<GenericConnectionInfo> {
  @IsString()
  public identityToken: string;
}

export const genericJsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'GenericConnectionInfo',
  type: 'object',
  properties: {
    identityToken: {
      type: 'string',
    },
  },
  required: ['identityToken'],
};
