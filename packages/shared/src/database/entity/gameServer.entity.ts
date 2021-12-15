import { Length } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';

import { TakaroBase } from './base';
import { Tenant } from './tenant.entity';

export enum GameServerTypes {
  MOCK = 'mock',
  SDTD = '7DaysToDie',
}

@Entity()
export class GameServer extends TakaroBase {
  @Column({ length: 80, })
  @Length(1, 80)
  name: string;

  @Column({
    type: 'json'
  })
  connectionInfo: Record<string, string>;


  @ManyToOne(() => Tenant, tenant => tenant.servers)
  tenant: Tenant;


  @Column({
    type: 'enum',
    enum: GameServerTypes,
  })
  type: GameServerTypes;
}

