import { useContext, createContext, Dispatch, SetStateAction } from 'react';
import { useDropdown } from './useDropdown';

type ContextType =
  | (ReturnType<typeof useDropdown> & {
      setLabelId: Dispatch<SetStateAction<string | undefined>>;
      setDescriptionId: Dispatch<SetStateAction<string | undefined>>;
    })
  | null;

export const DropdownContext = createContext<ContextType>(null);

export const useDropdownContext = () => {
  const context = useContext(DropdownContext);

  if (context == null) {
    throw new Error('Dropdown components must be wrapped in <Dropdown />');
  }

  return context;
};
