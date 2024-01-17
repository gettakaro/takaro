import { createContext, useContext } from 'react';

type ContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
} | null;

export const CollapsibleContext = createContext<ContextType>(null);

export const useCollapsibleContext = () => {
  const context = useContext(CollapsibleContext);

  if (context == null) {
    throw new Error('collapsible components must be wrapped in <Collapsible />');
  }
  return context;
};
