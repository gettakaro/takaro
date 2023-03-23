import { GameServerOutputDTO } from '@takaro/apiclient';
import { Dispatch, createContext } from 'react';

export interface GameServerContext {
  gameServerData: GameServerData;
  setGameServerData: Dispatch<GameServerData>;
}

export interface GameServerData extends GameServerOutputDTO {}

export const GameServerContext = createContext<GameServerContext>(
  null as unknown as GameServerContext
);
