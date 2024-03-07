import { useContext, createContext } from 'react';
import { usePopover } from './usePopover';

type ContextType =
  | (ReturnType<typeof usePopover> & {
      setLabelId: React.Dispatch<React.SetStateAction<string | undefined>>;
      setDescriptionId: React.Dispatch<React.SetStateAction<string | undefined>>;
    })
  | null;

export const PopoverContext = createContext<ContextType>(null);

export const usePopoverContext = () => {
  const context = useContext(PopoverContext);

  if (context == null) {
    throw new Error('Popover components must be wrapped in <Popover />');
  }

  return context;
};
