import { createContext } from 'react';

export interface ISelectedGameServerContext {
  selectedGameServerId: string;
  setSelectedGameServerId: (id: string) => void;
}

export const SelectedGameServerContext = createContext<ISelectedGameServerContext | null>(null);
