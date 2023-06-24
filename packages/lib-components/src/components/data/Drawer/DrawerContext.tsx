import { useContext, createContext, SetStateAction, Dispatch } from 'react';
import { useDrawer } from './useDrawer';

type ContextType =
  | (ReturnType<typeof useDrawer> & {
      setLabelId: Dispatch<SetStateAction<string | undefined>>;
      setDescriptionId: Dispatch<SetStateAction<string | undefined>>;
    })
  | null;

export const DrawerContext = createContext<ContextType>(null);

export const useDrawerContext = () => {
  const context = useContext(DrawerContext);

  if (context == null) {
    throw new Error('Dialog components must be wrapped in <Dialog />');
  }

  return context;
};
