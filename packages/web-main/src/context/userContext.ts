import { UserOutputWithRolesDTO } from '@takaro/apiclient';
import { Dispatch, createContext } from 'react';

export interface IUserContext {
  userData: Partial<UserOutputWithRolesDTO>;
  setUserData: Dispatch<Partial<UserOutputWithRolesDTO>>;
}

export const UserContext = createContext<IUserContext>(undefined!);
