import { TakaroModel } from '@takaro/db';
import { Model } from 'objection';
import { RoleModel, ROLE_TABLE_NAME } from './role';
import { PLAYER_ON_GAMESERVER_TABLE_NAME } from './gameserver';

export const PLAYER_TABLE_NAME = 'players';

export class PlayerModel extends TakaroModel {
  static tableName = PLAYER_TABLE_NAME;
  name!: string;

  static relationMappings = {
    roles: {
      relation: Model.ManyToManyRelation,
      modelClass: RoleModel,
      join: {
        from: `${PLAYER_TABLE_NAME}.id`,
        through: {
          from: `${PLAYER_ON_GAMESERVER_TABLE_NAME}.gameServerId`,
          to: `${PLAYER_ON_GAMESERVER_TABLE_NAME}.roleId`,
        },
        to: `${ROLE_TABLE_NAME}.id`,
      },
    },
  };
}
