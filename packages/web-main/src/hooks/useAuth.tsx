import { useQueryClient } from '@tanstack/react-query';
import { MeOutputDTO } from '@takaro/apiclient';
import { createContext, useCallback, useContext } from 'react';
import { useOry } from './useOry';
import * as Sentry from '@sentry/react';
import { getApiClient } from '../util/getApiClient';
import { usePostHog } from 'posthog-js/react';
import { userKeys } from '../queries/user';

export interface IAuthContext {
  logOut: () => Promise<void>;
  getSession: () => Promise<MeOutputDTO>;
  login: (user: MeOutputDTO) => void;
}

export const AuthContext = createContext<IAuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { oryClient } = useOry();
  const posthog = usePostHog();

  const logOut = useCallback(async () => {
    const logoutFlowRes = await oryClient.createBrowserLogoutFlow();
    queryClient.clear();
    window.location.href = logoutFlowRes.data.logout_url;
    // Extra clean up is done in /logout-return
    return Promise.resolve();
  }, [oryClient, queryClient]);

  const login = useCallback((session: MeOutputDTO) => {
    Sentry.setUser({ id: session.user.id, email: session.user.email, username: session.user.name });
    posthog.identify(session.user.idpId, {
      email: session.user.email,
      domain: session.domain,
    });
  }, []);

  const getSession = async function (): Promise<MeOutputDTO> {
    try {
      const newSession = (
        await getApiClient().user.userControllerMe({
          headers: {
            'Cache-Control': 'no-cache',
          },
        })
      ).data.data;
      queryClient.setQueryData(userKeys.me(), newSession);
      return newSession;
    } catch {
      queryClient.clear();
      return Promise.reject();
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
