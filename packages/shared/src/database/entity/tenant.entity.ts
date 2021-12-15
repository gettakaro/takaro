import { Length } from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';

import { GameServer } from '..';
import { TakaroBase } from './base';

@Entity()
export class Tenant extends TakaroBase {
  @Column({ length: 80 })
  @Length(1, 80)
  name: string;

  @OneToMany(() => GameServer, (server) => server.tenant)
  servers: GameServer[];
}
