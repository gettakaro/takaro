import { IsEmail, Length } from 'class-validator';
import { Column, Entity } from 'typeorm';

import { TakaroBase } from './base';

@Entity()
export class User extends TakaroBase {
  @Column({
    length: 80,
  })
  @Length(10, 80)
  name: string;

  @Column({
    length: 100,
  })
  @Length(10, 100)
  @IsEmail()
  email: string;
}
