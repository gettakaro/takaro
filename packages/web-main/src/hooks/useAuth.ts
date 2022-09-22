import { useContext } from 'react';
import { AuthContext } from '../context/authContext';

export const useAuth = () => {
  return useContext(AuthContext);
};
