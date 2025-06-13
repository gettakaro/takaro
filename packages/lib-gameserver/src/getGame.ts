import { errors } from '@takaro/util';
import { GameServerOutputDTOTypeEnum, Settings } from '@takaro/apiclient';
import { SdtdConnectionInfo } from './gameservers/7d2d/connectionInfo.js';
import { SevenDaysToDie } from './gameservers/7d2d/index.js';
import { RustConnectionInfo } from './gameservers/rust/connectionInfo.js';
import { Rust } from './gameservers/rust/index.js';
import { IGameServer } from './interfaces/GameServer.js';
import { GenericConnectionInfo } from './gameservers/generic/connectionInfo.js';
import { Generic } from './gameservers/generic/index.js';

export enum GAME_SERVER_TYPE {
  'SEVENDAYSTODIE' = 'SEVENDAYSTODIE',
  'RUST' = 'RUST',
  'GENERIC' = 'GENERIC',
  'MOCK' = 'MOCK',
}

export async function getGame(
  type: GAME_SERVER_TYPE | GameServerOutputDTOTypeEnum,
  connectionInfo: Record<string, unknown>,
  settings: Partial<Settings>,
  gameServerId: string,
): Promise<IGameServer> {
  switch (type) {
    case GAME_SERVER_TYPE.SEVENDAYSTODIE:
      return new SevenDaysToDie(new SdtdConnectionInfo(connectionInfo), settings);
    case GAME_SERVER_TYPE.RUST:
      return new Rust(new RustConnectionInfo(connectionInfo), settings);
    case GAME_SERVER_TYPE.GENERIC:
      return new Generic(new GenericConnectionInfo(connectionInfo), settings, gameServerId);
    default:
      throw new errors.NotImplementedError();
  }
}
