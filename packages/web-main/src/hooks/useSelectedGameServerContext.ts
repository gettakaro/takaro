import { useContext } from 'react';
import { SelectedGameServerContext } from '../context/selectedGameServerContext';

export const useSelectedGameServer = () => {
  const context = useContext(SelectedGameServerContext);

  if (!context) {
    throw new Error('Component must be wrapped with <SelectedGameServerProvider> to use this hook.');
  }

  return context;
};
