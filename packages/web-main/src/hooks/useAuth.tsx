import { useQueryClient } from '@tanstack/react-query';
import { UserOutputWithRolesDTO } from '@takaro/apiclient';
import { createContext, useCallback, useContext } from 'react';
import { useOry } from './useOry';
import * as Sentry from '@sentry/react';
import { DateTime } from 'luxon';
import { getApiClient } from 'util/getApiClient';

const SESSION_EXPIRES_AFTER_MINUTES = 5;

interface ExpirableSession {
  session: UserOutputWithRolesDTO;
  expiresAt: string;
}

export interface IAuthContext {
  logOut: () => Promise<void>;
  getSession: () => Promise<UserOutputWithRolesDTO>;
  login: (user: UserOutputWithRolesDTO) => void;
}

function getLocalSession() {
  const expirableSessionString = localStorage.getItem('session');

  if (!expirableSessionString) {
    return null;
  }

  const expirableSession: ExpirableSession = JSON.parse(expirableSessionString);
  if (DateTime.fromISO(expirableSession.expiresAt) < DateTime.now()) {
    return null;
  }
  return expirableSession.session;
}

function setLocalSession(session: UserOutputWithRolesDTO | null) {
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

export const AuthContext = createContext<IAuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { oryClient } = useOry();

  const logOut = useCallback(async () => {
    const logoutFlowRes = await oryClient.createBrowserLogoutFlow();
    setLocalSession(null);
    queryClient.clear();
    window.location.href = logoutFlowRes.data.logout_url;
    // Extra clean up is done in /logout-return
    return Promise.resolve();
  }, [oryClient, queryClient]);

  const login = useCallback((session: UserOutputWithRolesDTO) => {
    setLocalSession(session);
    Sentry.setUser({ id: session.id, email: session.email, username: session.name });
  }, []);

  const getSession = async function (): Promise<UserOutputWithRolesDTO> {
    const session = getLocalSession();

    if (session) {
      return session;
    }

    try {
      const newSession = (
        await getApiClient().user.userControllerMe({
          headers: {
            'Cache-Control': 'no-cache',
          },
        })
      ).data.data.user;
      setLocalSession(session);
      return newSession;
    } catch (error) {
      // logout if session is invalid
      localStorage.removeItem('session');
      setLocalSession(null);
      queryClient.clear();
      window.location.href = '/login';
      throw 'should not have no session and not be redirected to login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        logOut,
        getSession,
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
