import { useContext } from 'react';
import { createContext } from 'react';

export interface ISelectedGameServerContext {
  selectedGameServerId: string;
  setSelectedGameServerId: (id: string) => void;
}
export const SelectedGameServerContext = createContext<ISelectedGameServerContext | null>(null);

export const useSelectedGameServer = () => {
  const context = useContext(SelectedGameServerContext);
  if (!context) {
    throw new Error('useSelectedGameServer must be used within a SelectedGameServerProvider');
  }
  return context;
};
