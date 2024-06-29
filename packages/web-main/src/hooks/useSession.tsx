import { UserOutputWithRolesDTO } from '@takaro/apiclient';
import { createContext, useContext } from 'react';

export interface ISessionContext {
  session: UserOutputWithRolesDTO;
}

export const SessionContext = createContext<ISessionContext>({} as any);

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
