import { useContext } from 'react';
import { ModuleContext } from '../context/moduleContext';

export const useModule = () => {
  const context = useContext(ModuleContext);

  if (!context.moduleData) {
    throw new Error('ModuleData should not be undefined');
  }

  return context;
};
