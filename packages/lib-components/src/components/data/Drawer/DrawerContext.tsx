import { useContext, createContext } from 'react';
import { useDrawer } from './useDrawer';

type ContextType =
  | (ReturnType<typeof useDrawer> & {
      setLabelId: React.Dispatch<React.SetStateAction<string | undefined>>;
      setDescriptionId: React.Dispatch<
        React.SetStateAction<string | undefined>
      >;
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
