import { createContext } from 'react';
import { ContextData } from '@floating-ui/react';

export interface SelectItem {
  value: string;
  label: string;
}

interface ContextValue {
  selectedItems: SelectItem[];
  setSelectedItems: (item: SelectItem[]) => void;
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
  listRef: React.MutableRefObject<Array<HTMLLIElement | null>>;
  setOpen: (open: boolean) => void;
  getItemProps: (userProps?: React.HTMLProps<HTMLElement>) => any;
  dataRef: ContextData;
  multiSelect: boolean;
  name: string;
}

export const SelectContext = createContext<ContextValue>({} as ContextValue);
