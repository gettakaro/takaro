import { ChangeEvent, forwardRef, MouseEvent, PropsWithChildren, useRef, useState } from 'react';
import { InputContainer, Input, AutoCompleteContainer, ListItem } from './style';
import { AiOutlineFilter as FilterIcon } from 'react-icons/ai';
import {
  FloatingFocusManager,
  FloatingPortal,
  useDismiss,
  useInteractions,
  useListNavigation,
  useMergeRefs,
  useRole,
  useTransitionStyles,
  useTypeahead,
  size,
  flip,
  offset,
  autoUpdate,
  useFloating,
  FloatingList,
  useListItem,
} from '@floating-ui/react';

export interface FilterFieldProps {
  data?: string[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const FilterField = forwardRef<HTMLDivElement, FilterFieldProps>(
  ({ open: controlledOpen, onOpenChange: setControlledOpen, data = [] }, propRef) => {
    const elementsRef = useRef<Array<HTMLButtonElement | null>>([]);
    const labelsRef = useRef<Array<string | null>>([]);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const [inputValue, setInputValue] = useState<string>('');

    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    const { context, floatingStyles } = useFloating({
      open,
      onOpenChange: setOpen,
      whileElementsMounted: autoUpdate,
      middleware: [
        offset(5),
        size({
          apply({ rects, availableHeight, elements, availableWidth }) {
            Object.assign(elements.floating.style, {
              width: `${Math.min(rects.reference.width + 25, availableWidth)}px`,
              maxHeight: `${Math.max(150, availableHeight)}px`,
            });
          },
          padding: 10,
        }),
        flip({
          fallbackStrategy: 'bestFit',
          fallbackPlacements: ['top', 'bottom'],
        }),
      ],
    });

    const ref = useMergeRefs([context.refs.setFloating, propRef]);

    const { getFloatingProps, getReferenceProps, getItemProps } = useInteractions([
      useRole(context, { role: 'listbox' }),
      useDismiss(context),
      useListNavigation(context, {
        listRef: elementsRef,
        activeIndex,
        onNavigate: setActiveIndex,
        virtual: true,
        loop: true,
        allowEscape: true,
      }),
      useTypeahead(context, {
        enabled: context.open,
        listRef: labelsRef,
        onMatch: setActiveIndex,
        activeIndex,
      }),
    ]);

    const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
      duration: {
        open: 0,
        close: 100,
      },
      initial: { opacity: 0, transform: 'scale(0.8)' },
      open: { opacity: 1, transform: 'translate(0)' },
      close: { opacity: 0, transform: 'scale(0.8)' },
    });

    const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setInputValue(value);

      if (value) {
        setOpen(true);
        setActiveIndex(0);
      } else {
        setOpen(false);
      }
    };

    const items = data.filter((item) => item.toLowerCase().startsWith(inputValue?.toLowerCase()));

    return (
      <>
        <InputContainer>
          <FilterIcon className="icon" />
          <Input
            {...getReferenceProps({
              onChange: handleOnChange,
              value: inputValue,
              'aria-autocomplete': 'list',
              placeholder: 'Filter by keyword or by field',
              autoComplete: 'off',
              autoCapitalize: 'off',
              ref: context.refs.setReference,
              onKeyDown(event) {
                if (event.key === 'Enter' && activeIndex != null && items[activeIndex]) {
                  setInputValue(items[activeIndex]);
                  setActiveIndex(null);
                  setOpen(false);
                }
              },
            })}
          />
        </InputContainer>
        {isMounted && (
          <FloatingPortal>
            <FloatingFocusManager context={context} modal={false} initialFocus={-1} visuallyHiddenDismiss>
              <AutoCompleteContainer
                ref={ref}
                style={{ ...transitionStyles, ...floatingStyles }}
                {...getFloatingProps()}
              >
                <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
                  {items.map((item) => (
                    <Item
                      key={item}
                      value={item}
                      setInputValue={setInputValue}
                      setOpen={setOpen}
                      activeIndex={activeIndex ?? 0}
                      getItemProps={getItemProps}
                    >
                      {item}
                    </Item>
                  ))}
                </FloatingList>
              </AutoCompleteContainer>
            </FloatingFocusManager>
          </FloatingPortal>
        )}
      </>
    );
  }
);

interface ItemProps {
  value: string;
  setInputValue: (value: string) => void;
  setOpen: (open: boolean) => void;
  activeIndex?: number;
  getItemProps: (userProps?: React.HTMLProps<HTMLElement> | undefined) => Record<string, unknown>;
}

export const Item = forwardRef<HTMLDivElement, PropsWithChildren<ItemProps>>(
  ({ children, setInputValue, setOpen, value, activeIndex, getItemProps }, _forwardedRef) => {
    const { ref, index } = useListItem();
    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setInputValue(value);
      setOpen(false);
    };

    const isActive = activeIndex === index;

    return (
      <ListItem
        aria-selected={isActive}
        role="option"
        type="button"
        {...getItemProps({ onClick: handleClick, ref })}
        isActive={isActive}
      >
        {children}
      </ListItem>
    );
  }
);
