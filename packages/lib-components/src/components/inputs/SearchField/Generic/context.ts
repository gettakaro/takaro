import { createContext } from 'react';
import { ContextData } from '@floating-ui/react';
import { InputValue } from '.';

interface SearchFieldContextValue {
  inputValue: InputValue;
  setInputValue: (value: InputValue) => void;
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
  listRef: React.MutableRefObject<Array<HTMLLIElement | null>>;
  setOpen: (open: boolean) => void;
  getItemProps: (userProps?: React.HTMLProps<HTMLElement>) => any;
  dataRef: ContextData;
}

export const SearchFieldContext = createContext<SearchFieldContextValue>({} as SearchFieldContextValue);
