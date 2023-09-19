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
import { defaultInputProps, defaultInputPropsFactory, GenericInputProps } from '../InputProps';
import { useDebounce } from '../../../hooks';
import { setAriaDescribedBy } from '../layout';

const Input = styled.input<{ hasError: boolean }>`
  border: 1px solid ${({ theme, hasError }) => (hasError ? theme.colors.error : theme.colors.backgroundAlt)};
`;

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
  isLoading: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
}

export type GenericSearchFieldProps = GenericInputProps<string, HTMLInputElement> & SearchFieldProps;
const defaultsApplier = defaultInputPropsFactory<GenericSearchFieldProps>(defaultInputProps);

export const GenericSearchField = forwardRef<HTMLInputElement, GenericSearchFieldProps>((props, ref) => {
  const {
    onBlur = () => {},
    onFocus = () => {},
    onChange,
    name,
    items,
    disabled,
    required,
    placeholder = 'Search field',
    hasDescription,
    hasError,
  } = defaultsApplier(props);

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
      <Input
        hasError={hasError}
        {...getReferenceProps({
          ref: refs.setReference,
          onChange: onInputChange,
          value: inputValue,
          placeholder: placeholder,
          name: name,
          onBlur: onBlur,
          onFocus: onFocus,
          disabled: disabled,
          autoComplete: 'off',
          'aria-describedby': setAriaDescribedBy(name, hasDescription),
          'aria-autocomplete': 'list',
          'aria-required': required,
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
