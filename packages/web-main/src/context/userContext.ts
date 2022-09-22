import { Dispatch, createContext } from 'react';

export interface IUserContext {
  userData: Partial<UserData>;
  setUserData: Dispatch<Partial<UserData>>;
}

export interface UserData {
  id: string | null;
  email: string | null;
  name: string | null;
}

export const UserContext = createContext<IUserContext>(undefined!);
