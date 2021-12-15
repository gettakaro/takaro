import { Length } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';

import { TakaroBase } from './base';
import { GameServer } from './gameServer.entity';

@Entity()
export class Player extends TakaroBase {
  @Column({
    length: 80,
  })
  @Length(1, 80)
  name: string;

  /**
   * Game-internal unique identifier
   */
  @Column()
  gameId: string;

  @Column()
  steamId?: string;

  @ManyToOne(type => GameServer)
  server: string;

  static async findOrCreate(data: Partial<Player>) {
    const player = await Player.findOne({
      where: { ...data },
    });

    if (player) {
      return player as Player;
    }

    const newPlayer = new Player();
    Object.assign(newPlayer, data);
    await newPlayer.save();
    return newPlayer;

  }
}

