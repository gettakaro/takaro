import { IsUUID } from 'class-validator';

export class ParamId {
  @IsUUID('4')
  id!: string;
}
