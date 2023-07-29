import { forwardRef, useEffect, useRef, useState } from 'react';
import {
  autoUpdate,
  FloatingFocusManager,
  FloatingPortal,
  size,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
} from '@floating-ui/react';
import { styled } from '../../../styled';
import { useDebounce } from '../../../hooks';

const ItemContainer = styled.div<{ isActive: boolean }>`
  background: ${({ theme, isActive }) => (isActive ? theme.colors.primary : theme.colors.background)};
  padding: ${({ theme }) => theme.spacing[1]};
  cursor: default;
`;

interface Item {
  label: string;
  value: string;
}

export interface SearchFieldProps {
  items: Item[];
  onChange: (value: string) => void;
}

export const SearchField = forwardRef<HTMLDivElement, SearchFieldProps>(({ items, onChange }, ref) => {
  const [open, setOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const debouncedValue = useDebounce(inputValue, 1000);

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  const listRef = useRef<Array<HTMLElement | null>>([]);

  const { refs, floatingStyles, context } = useFloating<HTMLInputElement>({
    whileElementsMounted: autoUpdate,
    open,
    onOpenChange: setOpen,
    middleware: [
      size({ padding: 10 }),
      size({
        apply({ rects, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${availableHeight}px`,
          });
        },
        padding: 10,
      }),
    ],
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    useRole(context, { role: 'listbox' }),
    useDismiss(context),
    useListNavigation(context, {
      listRef,
      activeIndex,
      onNavigate: setActiveIndex,
      virtual: true,
      loop: true,
    }),
  ]);

  function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setInputValue(value);

    if (value) {
      setOpen(true);
      setActiveIndex(0);
    } else {
      setOpen(false);
    }
  }

  return (
    <div ref={ref}>
      <input
        {...getReferenceProps({
          ref: refs.setReference,
          onChange: onInputChange,
          value: inputValue,
          placeholder: 'enter',
          'aria-autocomplete': 'list',
          onKeyDown(event) {
            if (event.key === 'Enter' && activeIndex != null && items[activeIndex]) {
              setInputValue(items[activeIndex].label);
              setActiveIndex(null);
              setOpen(false);
            }
          },
        })}
      />
      <FloatingPortal>
        {open && (
          <FloatingFocusManager context={context} initialFocus={-1} visuallyHiddenDismiss>
            <div
              {...getFloatingProps({
                ref: refs.setFloating,
                style: {
                  ...floatingStyles,
                  background: '#eee',
                  color: 'black',
                  overflowY: 'auto',
                },
              })}
            >
              {items.map((item, index) => (
                <ItemContainer
                  {...getItemProps({
                    key: item.value,
                    ref(node) {
                      listRef.current[index] = node;
                    },
                    onClick() {
                      setInputValue(item.label);
                      setOpen(false);
                      refs.domReference.current?.focus();
                    },
                  })}
                  isActive={activeIndex === index}
                >
                  {item.label}
                </ItemContainer>
              ))}
            </div>
          </FloatingFocusManager>
        )}
      </FloatingPortal>
    </div>
  );
});
