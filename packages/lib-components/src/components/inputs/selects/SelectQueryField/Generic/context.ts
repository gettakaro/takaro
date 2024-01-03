import { createContext } from 'react';
import { ContextData } from '@floating-ui/react';

export interface SearchFieldItem {
  value: string;
  label: string;
}

interface SearchFieldContextValue {
  selectedItems: SearchFieldItem[];
  setSelectedItems: (item: SearchFieldItem[]) => void;
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
  listRef: React.MutableRefObject<Array<HTMLLIElement | null>>;
  setOpen: (open: boolean) => void;
  getItemProps: (userProps?: React.HTMLProps<HTMLElement>) => any;
  dataRef: ContextData;
  multiSelect: boolean;
  name: string;
}

export const SearchFieldContext = createContext<SearchFieldContextValue>({} as SearchFieldContextValue);
