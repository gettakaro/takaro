import { TakaroService } from './Base';

import { GameServerModel, GameServerRepo } from '../db/gameserver';
import { IsJSON, IsString, IsUUID } from 'class-validator';

export class GameServerOutputDTO {
  @IsUUID()
  id!: string;
  @IsString()
  name!: string;
  @IsJSON()
  connectionInfo!: string;
}

export class GameServerCreateDTO {
  @IsString()
  name!: string;
  @IsJSON()
  connectionInfo!: string;
}

export class GameServerService extends TakaroService<GameServerModel> {
  get repo() {
    return new GameServerRepo(this.domainId);
  }
}
