import { MeOutputDTO } from '@takaro/apiclient';
import { createContext, useContext } from 'react';

export interface ISessionContext {
  session: MeOutputDTO;
}

export const SessionContext = createContext<ISessionContext>({} as any);

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within an SessionProvider');
  }
  return context;
}
