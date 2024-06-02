import { useQueryClient } from '@tanstack/react-query';
import { UserOutputWithRolesDTO } from '@takaro/apiclient';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useOry } from './useOry';
import * as Sentry from '@sentry/react';

export interface IAuthContext {
  logOut: () => Promise<void>;
  isAuthenticated: boolean;
  session: UserOutputWithRolesDTO;
  login: (user: UserOutputWithRolesDTO) => void;
}
export const AuthContext = createContext<IAuthContext | null>(null);

function getStoredSession(): UserOutputWithRolesDTO | null {
  const session = localStorage.getItem('session');
  return session ? JSON.parse(session) : null;
}

function setStoredSession(session: UserOutputWithRolesDTO | null) {
  if (session) {
    localStorage.setItem('session', JSON.stringify(session));
  } else {
    localStorage.removeItem('session');
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { oryClient } = useOry();
  const [user, setUser] = useState<UserOutputWithRolesDTO | null>(getStoredSession());

  const isAuthenticated = !!user;

  const logOut = useCallback(async () => {
    const logoutFlowRes = await oryClient.createBrowserLogoutFlow();
    setStoredSession(null);
    setUser(null);
    queryClient.clear();
    window.location.href = logoutFlowRes.data.logout_url;
    // Extra clean up is done in /logout-return
    return Promise.resolve();
  }, []);

  // Set session in both state and localStorage
  const login = useCallback((session: UserOutputWithRolesDTO) => {
    setStoredSession(session);
    Sentry.setUser({ id: session.id, email: session.email, username: session.name });
    setUser(session);
  }, []);

  useEffect(() => {
    setUser(getStoredSession());
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session: user as UserOutputWithRolesDTO,
        login: login,
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
