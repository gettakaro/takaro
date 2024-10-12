import { errors } from '@takaro/util';
import { GameServerOutputDTOTypeEnum, Settings } from '@takaro/apiclient';
import { SdtdConnectionInfo } from './gameservers/7d2d/connectionInfo.js';
import { SevenDaysToDie } from './gameservers/7d2d/index.js';
import { MockConnectionInfo } from './gameservers/mock/connectionInfo.js';
import { Mock } from './gameservers/mock/index.js';
import { RustConnectionInfo } from './gameservers/rust/connectionInfo.js';
import { Rust } from './gameservers/rust/index.js';
import { IGameServer } from './interfaces/GameServer.js';
import { Minecraft } from './gameservers/minecraft/index.js';
import { MinecraftConnectionInfo } from './gameservers/minecraft/connectionInfo.js';

export enum GAME_SERVER_TYPE {
  'MOCK' = 'MOCK',
  'SEVENDAYSTODIE' = 'SEVENDAYSTODIE',
  'RUST' = 'RUST',
  'MINECRAFT' = 'MINECRAFT',
}

export async function getGame(
  type: GAME_SERVER_TYPE | GameServerOutputDTOTypeEnum,
  connectionInfo: Record<string, unknown>,
  settings: Partial<Settings>,
): Promise<IGameServer> {
  switch (type) {
    case GAME_SERVER_TYPE.SEVENDAYSTODIE:
      return new SevenDaysToDie(new SdtdConnectionInfo(connectionInfo), settings);
    case GAME_SERVER_TYPE.RUST:
      return new Rust(new RustConnectionInfo(connectionInfo), settings);
    case GAME_SERVER_TYPE.MOCK:
      return new Mock(new MockConnectionInfo(connectionInfo), settings);
    case GAME_SERVER_TYPE.MINECRAFT:
      return new Minecraft(new MinecraftConnectionInfo(connectionInfo), settings);
    default:
      throw new errors.NotImplementedError();
  }
}
