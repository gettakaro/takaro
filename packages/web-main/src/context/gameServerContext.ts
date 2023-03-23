import { GameServerOutputDTO } from '@takaro/apiclient';
import { Dispatch, createContext } from 'react';

export interface IGameServerContext {
  gameServerData: GameServerData;
  setGameServerData: Dispatch<GameServerData>;
}

export interface GameServerData extends GameServerOutputDTO {}

export const GameServerContext = createContext<IGameServerContext>(
  null as unknown as IGameServerContext
);
