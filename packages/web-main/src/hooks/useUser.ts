import { useContext } from 'react';
import { UserContext } from '../context/userContext';

export const useUser = () => {
  return useContext(UserContext);
};
