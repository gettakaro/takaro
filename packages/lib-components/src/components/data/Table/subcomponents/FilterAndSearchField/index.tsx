import {
  ChangeEvent,
  forwardRef,
  MouseEvent,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  InputContainer,
  Input,
  AutoCompleteContainer,
  ListItem,
  TokenizerContainer,
  Inner,
  TokenKey,
  TokenValue,
} from './style';
import { getTokenChars, tokenize, TokenType } from './tokenizer';
import { AiOutlineFilter as FilterIcon, AiFillCloseCircle as ClearIcon } from 'react-icons/ai';
import {
  FloatingFocusManager,
  FloatingPortal,
  useDismiss,
  useInteractions,
  useListNavigation,
  useRole,
  size,
  flip,
  offset,
  autoUpdate,
  useFloating,
  FloatingList,
  useListItem,
} from '@floating-ui/react';
import { Table } from '@tanstack/react-table';
import { useTableContext } from '../../Context';
import { IconButton, Tooltip } from '../../../../../components';

export interface FilterAndSearchFieldProps<DataType extends object> {
  data?: string[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  table: Table<DataType>;
  amountMatches?: number;
}

export function FilterAndSearchField<DataType extends object>({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  data = [],
  table,
}: FilterAndSearchFieldProps<DataType>) {
  const {
    searchAndFilterInputValue: inputValue,
    setSearchAndFilterInputValue: setInputValue,
    SearchAndFilterInputRef: inputRef,
  } = useTableContext();

  const elementsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [isFocused, setIsFocused] = useState(false);

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
            width: `${Math.min(rects.reference.width, availableWidth)}px`,
            maxHeight: `${Math.max(150, availableHeight)}px`,
          });
        },
      }),
      flip({
        fallbackStrategy: 'bestFit',
        fallbackPlacements: ['top', 'bottom'],
      }),
    ],
  });

  useEffect(() => {
    const inputElement = inputRef.current;

    if (inputElement === document.activeElement) {
      setIsFocused(true);
    } else {
      setIsFocused(false);
    }
  }, [inputValue, inputRef]);

  useEffect(() => {
    const tokens = tokenize(inputValue);

    table.setColumnFilters(
      tokens
        .filter((token) => token.type === TokenType.EXACT_COLUMN)
        .map((token) => {
          return { id: token.key, value: token.value };
        })
    );

    const globalSearchToken = tokens.find((token) => token.type === TokenType.SEARCH_GLOBAL && token.value !== '');

    table.setGlobalFilter([
      // in case there is also a SEARCH_GLOBAL token, we will add a search to all columns that do not have a specific SEARCH_COLUMN filter yet.
      ...(globalSearchToken
        ? table.getAllLeafColumns().map((column) => ({ id: column.id, value: globalSearchToken.value }))
        : []),

      ...tokens
        .filter((token) => token.type === TokenType.SEARCH_COLUMN)
        .map((token) => ({ id: token.key, value: token.value })),
    ]);
  }, [inputValue]);

  const focusOnClick = useCallback(() => {
    inputRef.current?.focus();
  }, [inputRef]);

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
  ]);

  const handleOnChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);

    if (value) {
      setOpen(true);
      setActiveIndex(0);
    } else {
      setOpen(false);
    }

    if (value === '') {
      setOpen(true);
    }
  }, []);

  const items = useMemo(() => {
    return data.filter((item) => item.toLowerCase().startsWith(inputValue?.toLowerCase()));
  }, [data, inputValue]);

  return (
    <>
      <InputContainer
        onClick={focusOnClick}
        {...getReferenceProps({
          ref: context.refs.setReference,
        })}
      >
        <FilterIcon className="icon" />
        <Inner>
          <TokenizerContainer isFocused={isFocused}>
            {tokenize(inputValue).map((token, index) => {
              return (
                <>
                  <TokenKey key={index}>
                    {token.key}
                    {getTokenChars(token.type)}
                  </TokenKey>
                  <TokenValue>{token.value}</TokenValue>
                </>
              );
            })}
          </TokenizerContainer>
          <div style={{ height: '100%', minWidth: '100%' }}>
            <Input
              role="combobox"
              aria-expanded={open}
              aria-haspopup="listbox"
              aria-autocomplete="list"
              onChange={handleOnChange}
              placeholder="Filter by keyword or by field"
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="false"
              value={inputValue}
              ref={inputRef}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && activeIndex != null && items[activeIndex]) {
                  setInputValue(items[activeIndex] + getTokenChars(TokenType.EXACT_COLUMN));
                  setActiveIndex(null);
                  setOpen(false);
                }
              }}
            />
          </div>
        </Inner>
        {inputValue && (
          <Tooltip>
            <Tooltip.Trigger asChild>
              <IconButton
                onClick={() => {
                  setInputValue('');
                  setOpen(false);
                }}
                ariaLabel="Clear Search And Filter Input"
                icon={<ClearIcon className="icon" />}
              />
            </Tooltip.Trigger>
            <Tooltip.Content>Clear field</Tooltip.Content>
          </Tooltip>
        )}
      </InputContainer>
      {open && items.length !== 0 && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false} initialFocus={-1} visuallyHiddenDismiss>
            <AutoCompleteContainer ref={context.refs.setFloating} style={{ ...floatingStyles }} {...getFloatingProps()}>
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
      setInputValue(value + getTokenChars(TokenType.EXACT_COLUMN));
      setOpen(false);
    };

    const isActive = activeIndex === index;

    return (
      <ListItem
        aria-selected={isActive}
        role="option"
        type="button"
        tabIndex={isActive ? 0 : -1}
        isActive={isActive}
        {...getItemProps({ onClick: handleClick, ref })}
      >
        {children}
      </ListItem>
    );
  }
);
