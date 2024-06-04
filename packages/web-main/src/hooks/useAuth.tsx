import { useQueryClient } from '@tanstack/react-query';
import { UserOutputWithRolesDTO } from '@takaro/apiclient';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useOry } from './useOry';
import * as Sentry from '@sentry/react';
import { DateTime } from 'luxon';
import { getApiClient } from 'util/getApiClient';
import { redirect } from '@tanstack/react-router';

const SESSION_EXPIRES_AFTER_MINUTES = 5;

interface ExpirableSession {
  session: UserOutputWithRolesDTO;
  expiresAt: string;
}

export interface IAuthContext {
  logOut: () => Promise<void>;
  isAuthenticated: boolean;
  session: UserOutputWithRolesDTO;
  login: (user: UserOutputWithRolesDTO) => void;
}
export const AuthContext = createContext<IAuthContext | null>(null);

function getStoredSession(): UserOutputWithRolesDTO | null {
  const expirableSessionString = localStorage.getItem('session');

  if (!expirableSessionString) {
    return null;
  }

  const expirableSession: ExpirableSession = JSON.parse(expirableSessionString);
  if (DateTime.fromISO(expirableSession.expiresAt ?? DateTime.now()).diffNow().milliseconds < 0) {
    localStorage.removeItem('session');
    return null;
  }
  return expirableSession.session;
}

function setStoredSession(session: UserOutputWithRolesDTO | null) {
  if (session) {
    const expirableSession: ExpirableSession = {
      session,
      expiresAt: DateTime.now().plus({ minutes: SESSION_EXPIRES_AFTER_MINUTES }).toISO(),
    };
    localStorage.setItem('session', JSON.stringify(expirableSession));
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

  const refreshSession = useCallback(async () => {
    try {
      const response = await getApiClient().user.userControllerMe({
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const newSession = response.data.data;
      login(newSession);
    } catch (error) {
      setStoredSession(null);
      setUser(null);
      queryClient.clear();
      redirect({ to: '/login' });
    }
  }, [login, queryClient]);

  useEffect(() => {
    const storedSession = getStoredSession();
    if (!storedSession) {
      refreshSession();
    } else {
      setUser(storedSession);
    }
  }, [refreshSession]);

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
