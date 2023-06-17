import { UserOutputDTO } from '@takaro/apiclient';
import { Dispatch, createContext } from 'react';

export interface IUserContext {
  userData: Partial<UserOutputDTO>;
  setUserData: Dispatch<Partial<UserOutputDTO>>;
}

export const UserContext = createContext<IUserContext>(undefined!);
