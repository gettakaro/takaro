import { createContext } from 'react';
import { ContextData } from '@floating-ui/react';

interface SelectFieldContextValue {
  selectedIndex: number | number[];
  setSelectedIndex: (index: number | number[]) => void;
  values: string[];
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
  listRef: React.MutableRefObject<Array<HTMLLIElement | null>>;
  setOpen: (open: boolean) => void;
  getItemProps: (userProps?: React.HTMLProps<HTMLElement>) => any;
  dataRef: ContextData;
  multiSelect: boolean;
  name: string;
}

export const SelectFieldContext = createContext<SelectFieldContextValue>({} as SelectFieldContextValue);
