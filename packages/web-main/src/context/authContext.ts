import { createContext } from 'react';
import { UserData } from './userContext';
import { errors } from '@takaro/lib-components';
import { useApiClient } from 'hooks/useApiClient';

export interface IAuthContext {
  logIn: (
    email: string,
    password: string,
    redirect?: string
  ) => Promise<UserData>;
  logOut: () => Promise<boolean>;
  getSession: () => Promise<UserData>;
}

export function AuthProvider(): IAuthContext {
  const apiClient = useApiClient();

  async function logIn(email: string, password: string): Promise<UserData> {
    apiClient.username = email;
    apiClient.password = password;
    await apiClient.login();
    return getSession();
  }

  // This returns the User details (name,email,...)
  async function getSession(): Promise<UserData> {
    try {
      return (await apiClient.user.userControllerMe()).data.data;
    } catch (e) {
      throw new errors.NotAuthorizedError('');
    }
  }

  async function logOut(): Promise<boolean> {
    try {
      await apiClient.user.userControllerLogout();
      return true;
    } catch (e) {
      throw new errors.FailedLogOutError('');
    }
  }

  return { logIn, logOut, getSession };
}

export const AuthContext = createContext<IAuthContext>(AuthProvider());
