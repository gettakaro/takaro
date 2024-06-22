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

function getLocalSession() {
  const expirableSessionString = localStorage.getItem('session');

  if (!expirableSessionString) {
    return null;
  }

  const expirableSession: ExpirableSession = JSON.parse(expirableSessionString);
  if (DateTime.fromISO(expirableSession.expiresAt ?? DateTime.now().toISO()).diffNow().seconds < 0) {
    return null;
  }
  return expirableSession.session;
}

export const AuthContext = createContext<IAuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { oryClient } = useOry();
  const [user, setUser] = useState<UserOutputWithRolesDTO | null>(getLocalSession());

  const isAuthenticated = !!user;

  const logOut = useCallback(async () => {
    const logoutFlowRes = await oryClient.createBrowserLogoutFlow();
    setStoredSession(null);
    setUser(null);
    queryClient.clear();
    window.location.href = logoutFlowRes.data.logout_url;
    // Extra clean up is done in /logout-return
    return Promise.resolve();
  }, [oryClient, queryClient]);

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
      const newSession = response.data.data.user;
      login(newSession);
    } catch (error) {
      setStoredSession(null);
      setUser(null);
      queryClient.clear();
      redirect({ to: '/login' });
    }
  }, [login, queryClient]);

  const getSession = useCallback(async (): Promise<UserOutputWithRolesDTO | null> => {
    const session = getLocalSession();

    if (session) {
      return session;
    }

    try {
      await refreshSession();
      return JSON.parse(localStorage.getItem('session')!).session;
    } catch (error) {
      localStorage.removeItem('session');
      return null;
    }
  }, [refreshSession]);

  useEffect(() => {
    async function fetchSession() {
      const storedSession = await getSession();
      if (!storedSession) {
        refreshSession();
      } else {
        setUser(storedSession);
      }
    }
    fetchSession();
  }, [getSession, refreshSession]);

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

  return (
    <AuthContext.Provider
      value={{
        session: user as UserOutputWithRolesDTO,
        login,
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
