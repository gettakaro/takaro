import { Children, createContext, isValidElement, ReactElement, ReactNode } from 'react';
import { ContextData } from '@floating-ui/react';
import { OptionProps } from './SubComponents/Option';

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
  multiple: boolean;
  name: string;
}

export const SelectContext = createContext<ContextValue>({} as ContextValue);

export const getLabelFromChildren = (children: ReactNode, value: string) => {
  const matchedGroup = Children.toArray(children).find((group) => {
    if (!isValidElement(group)) return false;
    const matchedOption = Children.toArray(group.props.children)
      .filter(isValidElement)
      .find((option: ReactElement) => option.props.value === value);

    return Boolean(matchedOption);
  });

  if (matchedGroup && isValidElement(matchedGroup)) {
    const matchedOption = Children.toArray(matchedGroup.props.children)
      .filter(isValidElement)
      .find((option: ReactElement) => option.props.value === value) as ReactElement<OptionProps>;

    if (matchedOption) {
      return matchedOption.props.label;
    }
  }

  // eslint-disable-next-line no-console
  console.error(
    `No label found for value ${value}. This occurs when a value is passed through the defaultValue prop of useForm, but the value is not present in the options.`,
  );
  return undefined;
};
