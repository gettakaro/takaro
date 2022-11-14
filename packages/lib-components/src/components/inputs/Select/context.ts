import { createContext } from 'react';
import { ContextData } from '@floating-ui/react-dom-interactions';

interface SelectContextValue {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
  listRef: React.MutableRefObject<Array<HTMLLIElement | null>>;
  setOpen: (open: boolean) => void;
  getItemProps: (userProps?: React.HTMLProps<HTMLElement>) => any;
  dataRef: ContextData;
}

export const SelectContext = createContext<SelectContextValue>(
  {} as SelectContextValue
);
