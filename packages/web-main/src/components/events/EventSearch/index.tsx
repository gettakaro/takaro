import { FC, useRef, useState } from 'react';
import {
  autoUpdate,
  size,
  flip,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
  FloatingFocusManager,
  FloatingPortal,
  offset,
} from '@floating-ui/react';
import {
  Input,
  InputContainer,
  InputTypeContainer,
  ItemList,
  PrefixContainer,
  SuffixContainer,
  Wrapper,
} from './style';
import { Item } from './Item';
import { Filter, InputType, Operator } from '../types';

import { HiMagnifyingGlass as SearchIcon, HiXMark as CloseIcon } from 'react-icons/hi2';

function inputTypeMap(type: InputType) {
  switch (type) {
    case InputType.field:
      return 'f';
    case InputType.operator:
      return 'o';
    case InputType.value:
      return 'v';
    case InputType.conjunction:
      return 'c';
  }
}

type EventSearchProps = {
  fields: string[];
  operators: string[];
  conjunctions: string[];
  setFilters: (filters: Filter[]) => void;
  getValueOptions: (field: string) => string[];
};

export const EventSearch: FC<EventSearchProps> = ({ fields, operators, setFilters, getValueOptions }) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const inputArray = inputValue.split(' ');
  const inputIndex = inputArray.length - 1;

  const listRef = useRef<Array<HTMLElement | null>>([]);

  const { refs, floatingStyles, context } = useFloating<HTMLInputElement>({
    whileElementsMounted: autoUpdate,
    open,
    onOpenChange: setOpen,
    middleware: [
      offset(5),
      flip({ padding: 10 }),
      size({
        apply({ rects, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: availableHeight < 500 ? `${availableHeight}px` : '500px',
            overflowY: 'auto',
          });
        },
        padding: 10,
      }),
    ],
  });

  const role = useRole(context, { role: 'listbox' });
  const dismiss = useDismiss(context);
  const listNav = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    virtual: true,
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([role, dismiss, listNav]);

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(event.target.value);

    if (!open) {
      setOpen(true);
    }
  }

  function onClick() {
    if (!open) {
      setOpen(true);
      setActiveIndex(null);
    }
  }

  const suggestions = (() => {
    const type: InputType = inputIndex;

    let d: string[] = [];

    switch (type) {
      case InputType.field:
        d = fields;
        break;
      case InputType.operator:
        d = operators;
        break;
      case InputType.value:
        return getValueOptions(inputArray[0]).map((value) => `"${value}"`);
      case InputType.conjunction:
        break;
    }

    return d.filter((item) => item.toLowerCase().startsWith(inputArray[inputIndex].toLowerCase()));
  })();

  function acceptSuggestion(index: number) {
    const selected = suggestions[index];
    const newInput = `${inputArray.slice(0, inputIndex).join(' ')}${inputIndex > 0 ? ' ' : ''}${selected} `;

    setInputValue(newInput);
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    // if there is no selected item, we want to add the current input as a filter
    if (activeIndex == null) {
      setOpen(false);

      const newFilters: Filter[] = [];

      const [field, operator, value] = inputArray.slice(InputType.field, InputType.value + 1);

      if (field && operator && value) {
        newFilters.push({
          field,
          operator: operator as Operator,
          value: value.replace(/"/g, ''),
        });
      }

      setFilters(newFilters);

      return;
    }

    if (suggestions[activeIndex]) {
      acceptSuggestion(activeIndex);
    }

    setActiveIndex(null);
  };

  return (
    <Wrapper>
      <InputContainer>
        <PrefixContainer>
          <SearchIcon />
        </PrefixContainer>
        <Input
          id="event-search"
          {...getReferenceProps({
            ref: refs.setReference,
            onChange,
            onClick,
            value: inputValue,
            placeholder: 'Search events',
            style: {
              width: '100%',
              height: '100%',
            },
            'aria-autocomplete': 'list',
            onKeyDown: handleKeyDown,
          })}
        />
        <SuffixContainer>
          {inputValue && (
            <CloseIcon
              onClick={() => {
                setInputValue('');
                setFilters([]);
              }}
            />
          )}
        </SuffixContainer>
      </InputContainer>
      <FloatingPortal>
        {open && (
          <FloatingFocusManager context={context} initialFocus={-1} visuallyHiddenDismiss>
            <ItemList
              ref={refs.setFloating}
              {...getFloatingProps({
                ref: refs.setFloating,
                style: {
                  ...floatingStyles,
                },
              })}
            >
              {suggestions.map((item: string, index: number) => (
                <Item
                  {...getItemProps({
                    ref(node) {
                      listRef.current[index] = node;
                    },
                    onClick() {
                      acceptSuggestion(index);
                    },
                  })}
                  key={item}
                  active={activeIndex === index}
                >
                  <InputTypeContainer>{inputTypeMap(inputIndex)}</InputTypeContainer>
                  {item}
                </Item>
              ))}
            </ItemList>
          </FloatingFocusManager>
        )}
      </FloatingPortal>
    </Wrapper>
  );
};
