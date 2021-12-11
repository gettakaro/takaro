import { Length } from 'class-validator';
import { Column, Entity } from 'typeorm';

import { TakaroBase } from './base';

@Entity()
export class GameServer extends TakaroBase {
  @Column({ length: 80, })
  @Length(1, 80)
  name: string;

  @Column({
    type: 'json'
  })
  connectionInfo: Record<string, string>;
}

