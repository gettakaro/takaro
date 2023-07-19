import { createContext, useContext } from 'react';
import { useTabs } from './useTabs';

type ContextType =
  | (ReturnType<typeof useTabs> & {
      setLabelId: React.Dispatch<React.SetStateAction<string | undefined>>;
      setDescriptionId: React.Dispatch<React.SetStateAction<string | undefined>>;
    })
  | null;

export const TabsContext = createContext<ContextType>(null);

export const useTabsContext = () => {
  const context = useContext(TabsContext);

  if (context == null) {
    throw new Error('tabs components must be wrapped in <Tabs /> component');
  }

  return context;
};
