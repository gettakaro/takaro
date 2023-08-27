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
} from '@floating-ui/react';
import { ItemList, Wrapper } from './style';
import { Item } from './Item';
import { Filter } from 'pages/events';

enum InputType {
  field = 0,
  operator = 1,
  value = 2,
  conjunction = 3,
}

type EventSearchProps = {
  fields: string[];
  operators: string[];
  conjunctions: string[];
  setFilters: (filters: Filter[]) => void;
  getValueOptions: (field: string) => string[];
};

export const EventSearch: FC<EventSearchProps> = ({ fields, operators, conjunctions, setFilters, getValueOptions }) => {
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
    const type: InputType = inputIndex % 4;

    let d: string[] = [];

    switch (type) {
      case InputType.field:
        d = fields;
        break;
      case InputType.operator:
        d = operators;
        break;
      case InputType.value:
        return getValueOptions(inputArray[0]);
      case InputType.conjunction:
        d = conjunctions;
        break;
    }

    return d.filter((item) => item.toLowerCase().startsWith(inputArray[inputIndex].toLowerCase()));
  })();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    if (activeIndex == null) {
      setOpen(false);

      const newFilters: Filter[] = [];

      const [field, operator, value] = inputArray.slice(InputType.field, InputType.value + 1);

      if (field && operator && value) {
        newFilters.push({
          field,
          operator,
          value,
        });
      }

      setFilters(newFilters);

      return;
    }

    if (suggestions[activeIndex]) {
      const selected = suggestions[activeIndex];
      const newInput = `${inputArray.slice(0, inputIndex).join(' ')}${inputIndex > 0 ? ' ' : ''}${selected} `;

      setInputValue(newInput);
    }

    setActiveIndex(null);
  };

  return (
    <Wrapper>
      <input
        {...getReferenceProps({
          ref: refs.setReference,
          onChange,
          onClick,
          value: inputValue,
          placeholder: 'Filter events',
          style: {
            width: '100%',
            height: '100%',
          },
          'aria-autocomplete': 'list',
          onKeyDown: handleKeyDown,
        })}
      />
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
                    key: item,
                    ref(node) {
                      listRef.current[index] = node;
                    },
                    onClick() {
                      setOpen(false);
                      refs.domReference.current?.focus();
                    },
                  })}
                  active={activeIndex === index}
                >
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
