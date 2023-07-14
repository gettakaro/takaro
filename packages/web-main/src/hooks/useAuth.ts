import { useApiClient } from 'hooks/useApiClient';
import { useConfig } from 'hooks/useConfig';

import { Configuration, FrontendApi } from '@ory/client';
import { useQuery } from '@tanstack/react-query';
import { UserOutputDTO } from '@takaro/apiclient';

let cachedClient: FrontendApi | null = null;

export interface IAuthContext {
  logIn: (email: string, password: string, redirect?: string) => Promise<UserOutputDTO>;
  logOut: () => Promise<boolean>;
  getSession: () => Promise<UserOutputDTO>;
}

export function useAuth() {
  const config = useConfig();
  const apiClient = useApiClient();
  const {
    data: sessionData,
    isLoading,
    refetch,
  } = useQuery(['session'], () => apiClient.user.userControllerMe(), {
    retry: 0,
  });

  if (!cachedClient) {
    cachedClient = new FrontendApi(
      new Configuration({
        basePath: config.oryUrl,
        baseOptions: {
          withCredentials: true,
        },
      })
    );
  }

  async function getCurrentFlow(flow: string) {
    const res = await cachedClient!.getLoginFlow({
      id: flow,
    });
    return res.data;
  }

  async function createLoginFlow() {
    const res = await cachedClient!.createBrowserLoginFlow({
      refresh: true,
    });
    return res.data;
  }

  async function logIn(flow: string, email: string, password: string, csrf_token: string): Promise<void> {
    await cachedClient!.updateLoginFlow({
      flow,
      updateLoginFlowBody: {
        csrf_token,
        identifier: email,
        password,
        method: 'password',
      },
    });
    refetch();
  }

  async function logOut(): Promise<boolean> {
    const logoutFlowRes = await cachedClient!.createBrowserLogoutFlow();
    window.location.href = logoutFlowRes.data.logout_url;
    return true;
  }

  return {
    logIn,
    logOut,
    getCurrentFlow,
    createLoginFlow,
    session: sessionData?.data.data,
    isLoading,
    oryClient: cachedClient,
  };
}
