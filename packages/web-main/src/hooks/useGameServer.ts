import { useContext } from 'react';
import { GameServerContext } from '../context/gameServerContext';

export const useGameServer = () => {
  return useContext(GameServerContext);
};
