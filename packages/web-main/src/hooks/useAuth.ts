import { errors } from '@takaro/lib-components';
import { UserData } from 'context/userContext';
import { useApiClient } from 'hooks/useApiClient';
import { useConfig } from 'hooks/useConfig';
import { useNavigate } from 'react-router-dom';

import { Configuration, FrontendApi, LoginFlow } from '@ory/client';
import axios, { isAxiosError } from 'axios';
import { PATHS } from 'paths';

let cachedClient: FrontendApi | null = null;

export interface IAuthContext {
  logIn: (
    email: string,
    password: string,
    redirect?: string
  ) => Promise<UserData>;
  logOut: () => Promise<boolean>;
  getSession: () => Promise<UserData>;
}

export function useAuth() {
  const config = useConfig();
  const apiClient = useApiClient();
  const navigate = useNavigate();

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

  async function logIn(
    flow: string,
    email: string,
    password: string,
    csrf_token: string
  ): Promise<UserData> {
    await cachedClient!.updateLoginFlow({
      flow,
      updateLoginFlowBody: {
        csrf_token,
        identifier: email,
        password,
        method: 'password',
      },
    });
    return getSession();
  }

  // This returns the User details (name,email,...)
  async function getSession(): Promise<UserData> {
    const session = await apiClient.user.userControllerMe();
    return {
      email: session.data.data.email,
      id: session.data.data.id,
      name: session.data.data.name,
    };
  }

  async function logOut(): Promise<boolean> {
    const logoutFlowRes = await cachedClient!.createBrowserLogoutFlow();
    window.location.href = logoutFlowRes.data.logout_url;
    return true;
  }

  return { logIn, logOut, getSession, getCurrentFlow, createLoginFlow };
}
