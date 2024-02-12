import { useQueryClient } from '@tanstack/react-query';
import { UserOutputWithRolesDTO } from '@takaro/apiclient';
import { createContext, useCallback, useContext, useState } from 'react';
import { useOry } from './useOry';

export interface IAuthContext {
  logOut: () => Promise<void>;
  isAuthenticated: boolean;
  session: UserOutputWithRolesDTO;
  setSession: (session: UserOutputWithRolesDTO) => void;
}
export const AuthContext = createContext<IAuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { oryClient } = useOry();
  const [user, setUser] = useState<UserOutputWithRolesDTO>(() => {
    const savedSession = sessionStorage.getItem('userSession');
    return savedSession ? JSON.parse(savedSession) : undefined;
  });
  const isAuthenticated = !!user;

  // TODO: set user when sessiopn is available
  // Sentry.setUser({ id: session.id, email: session.email, username: session.name });

  const logOut = useCallback(async () => {
    const logoutFlowRes = await oryClient.createBrowserLogoutFlow();
    // TODO: disable ory session
    // oryClient.disableMySession()
    localStorage.removeItem('selectedGameServerId');
    sessionStorage.removeItem('userSession');
    // router.invalidate();
    queryClient.clear();
    window.location.href = logoutFlowRes.data.logout_url;
    return Promise.resolve();
  }, []);

  // Set session in both state and localStorage
  const setSession = useCallback((session: UserOutputWithRolesDTO) => {
    sessionStorage.setItem('userSession', JSON.stringify(session));
    setUser(session);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session: user,
        setSession: setSession,
        logOut,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
