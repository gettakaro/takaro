import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  Children,
  PropsWithChildren,
  isValidElement,
  cloneElement,
  useMemo,
  MouseEvent,
  ReactElement,
} from 'react';
import {
  autoUpdate,
  FloatingFocusManager,
  FloatingPortal,
  size,
  useDismiss,
  flip,
  useFloating,
  useInteractions,
  useRole,
  offset,
  useClick,
} from '@floating-ui/react';
import { AiOutlineSearch as SearchIcon, AiOutlineClose as ClearIcon } from 'react-icons/ai';
import { defaultInputProps, defaultInputPropsFactory, GenericInputPropsFunctionHandlers } from '../../../InputProps';
import { useDebounce } from '../../../../../hooks';
import { setAriaDescribedBy } from '../../../layout';
import { FeedBackContainer } from '../style';
import { SelectItem, SelectContext, getLabelFromChildren } from '../../';
import { PaginationProps } from '../../../';

/* The SearchField depends on a few things of <Select/> */
import { GroupLabel } from '../../SelectField/style';
import { SelectContainer, SelectButton, StyledArrowIcon } from '../../sharedStyle';
import { IconButton, InfiniteScroll, Spinner } from '../../../../../components';
import { GenericTextField } from '../../../TextField/Generic';
import { Option, OptionGroup, SubComponentTypes } from '../../SubComponents';
import { OptionGroupProps } from '../../SubComponents/OptionGroup';

interface SharedSelectQueryFieldProps extends PaginationProps {
  // Enables loading data feedback for user
  isLoadingData?: boolean;
  /// The placeholder text to show when the input is empty
  placeholder?: string;
  /// Debounce time in milliseconds (when clientside data it should be 0)
  debounce?: number;
  /// Triggered whenever the input value changes.
  /// This is used to trigger the API call to get the new options
  handleInputValueChange?: (value: string) => void;

  /// When true, The select icon will be replaced by a cross icon to clear the selected value.
  canClear?: boolean;

  /// The selected items shown in the select field
  render?: (selectedItems: SelectItem[]) => React.ReactNode;

  /// Callback to be called when the select field is opened or closed
  onOpenChange?: (open: boolean) => void;

  /// The total options that will be visible when fully loaded
  optionCount?: number;
}

interface SingleSelectQueryFieldProps extends SharedSelectQueryFieldProps {
  multiple?: false;
}
interface MultiSelectQueryFieldProps extends SharedSelectQueryFieldProps {
  multiple: true;
}

interface SingleSelectQueryFieldHandlers extends GenericInputPropsFunctionHandlers<string, HTMLDivElement> {
  onChange: (val: string) => void;
}

interface MultiSelectQueryFieldHandlers extends GenericInputPropsFunctionHandlers<string[], HTMLDivElement> {
  onChange: (val: string[]) => void;
}

export type SelectQueryFieldProps = SingleSelectQueryFieldProps | MultiSelectQueryFieldProps;
export type GenericSelectQueryFieldProps = PropsWithChildren<
  | (SingleSelectQueryFieldProps & SingleSelectQueryFieldHandlers)
  | (MultiSelectQueryFieldProps & MultiSelectQueryFieldHandlers)
>;
const defaultsApplier = defaultInputPropsFactory<GenericSelectQueryFieldProps>(defaultInputProps);

export interface InputValue {
  value: string;
  label: string;
  /// When the user selects an option from the list, there is no need to do another API call
  shouldUpdate: boolean;
}

export const _GenericSelectQueryField = forwardRef<HTMLInputElement, GenericSelectQueryFieldProps>(
  function GenericSelectQueryField(props, ref) {
    const {
      onBlur = () => {},
      onFocus = () => {},
      onChange,
      name,
      disabled,
      /// Value are the selected items (most cases these are a list of IDs only)
      value,
      id,
      placeholder = 'Search field',
      hasDescription,
      hasError,
      children,
      readOnly,
      isFetchingNextPage,
      isFetching,
      fetchNextPage,
      hasNextPage,
      render,
      multiple = false,
      canClear = false,
      debounce = 250,
      isLoadingData = false,
      handleInputValueChange,
      onOpenChange,
      optionCount,
    } = defaultsApplier(props);

    const [open, setOpen] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<InputValue>({ value: '', shouldUpdate: false, label: '' });
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [currentSelectedItems, setCurrentSelectedItems] = useState<SelectItem[]>([]);
    const [persistedItems, setPersistedItems] = useState<SelectItem[]>([]);

    const debouncedValue = useDebounce(inputValue.value, debounce);
    const listItemsRef = useRef<Array<HTMLLIElement | null>>([]);

    useEffect(() => {
      if (handleInputValueChange) {
        if ((inputValue.shouldUpdate && debouncedValue) || (inputValue && debouncedValue === ''))
          handleInputValueChange(debouncedValue);
      }
    }, [debouncedValue]);

    useEffect(() => {
      if (onOpenChange) {
        onOpenChange(open);
      }
    }, [open]);

    const { refs, strategy, x, y, context } = useFloating<HTMLInputElement>({
      whileElementsMounted: autoUpdate,
      open,
      onOpenChange: readOnly || disabled ? () => {} : setOpen,
      middleware: [
        offset(5),
        size({
          apply({ availableHeight, elements, availableWidth }) {
            const refWidth = elements.reference.getBoundingClientRect().width;
            const floatingContentWidth = elements.floating.scrollWidth;

            const width =
              availableWidth > refWidth
                ? `${Math.min(availableWidth, 500)}px`
                : `${Math.max(refWidth, floatingContentWidth)}px`;

            Object.assign(elements.floating.style, {
              // Note: we cannot use the rects.reference.width here because if the referenced item is very small compared to the other options, there will be horizontal overflow.
              // fit-content isn't the perfect solution either, because if there is no space available it might render outside the viewport.
              width,
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

    const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
      useClick(context),
      useRole(context, { role: 'listbox' }),
      useDismiss(context),
    ]);

    function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
      const value = event.target.value;
      setInputValue({ value, shouldUpdate: true, label: value });
      if (value) {
        setActiveIndex(0);
      }
    }

    const handleClear = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentSelectedItems([]);
      setPersistedItems([]);

      // the undefined is an expection
      if (onChange) onChange(multiple ? ([] as string[]) : (undefined as any));
    };

    /* This handles the case where the value is changed externally (e.g. from a parent component) */
    /* onChange propagates the value to the parent component, but since the value prop is not a required prop, the parent might not reflect the change
     * which ends up not running this useEffect. Meaning we still need to update the selectedIndex when clicked on an option.
     */
    useEffect(() => {
      /// Value only contains the ids of the selected items, not their labels, The labels are fetched from the items found in the list of options.
      /// One caveat is that the list of options might change due to the search query, so the labels might not be found.
      const createItem = (v: string) => ({ value: v, label: getLabelFromChildren(children, v) as unknown as string });

      if (Array.isArray(value)) {
        // first we divide the value array into two arrays, one that are already in preserved (so we don't need to fetch the label again)
        // and the other one that are not in the preserved array (so we need to fetch the label)
        const [preserved, toFetch] = value.reduce(
          (acc, v) => {
            if (persistedItems.find((item) => item.value === v)) {
              acc[0].push(v);
            } else {
              acc[1].push(v);
            }
            return acc;
          },
          [[], []] as [string[], string[]],
        );

        const fetched = toFetch.map(createItem);
        const items = [...persistedItems.filter((item) => preserved.includes(item.value)), ...fetched];
        setPersistedItems(items);
        setCurrentSelectedItems(items);
      } else if (typeof value === 'string' && value !== '') {
        // check if value is already part of the persisted items
        const item = persistedItems.find((item) => item.value === value);
        // if yes, then we don't need to fetch the label again
        if (item) {
          setCurrentSelectedItems([item]);
        } else {
          setCurrentSelectedItems([createItem(value)]);
        }
        setCurrentSelectedItems([createItem(value)]);
      }
    }, [value, children]);

    const renderSelect = () => {
      const hasOptions =
        options &&
        options.some((optionGroup) =>
          Children.toArray(optionGroup.props.children).some(
            (option) => isValidElement(option) && (option as any).props?.children,
          ),
        );

      // initialFocus=-1 is used to prevent the first item from being focused when the list opens
      return (
        <FloatingFocusManager context={context} visuallyHiddenDismiss initialFocus={-1}>
          <SelectContainer
            {...getFloatingProps({
              ref: refs.setFloating,
              style: {
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                overflow: 'auto',
              },
            })}
          >
            {' '}
            {handleInputValueChange && (
              <GenericTextField
                id={`${name}-input`}
                name={`${name}-input`}
                hasDescription={false}
                icon={<SearchIcon />}
                suffix={isLoadingData ? 'Loading' : optionCount !== undefined ? `Result: ${optionCount}` : undefined}
                hasError={hasError}
                value={inputValue.value}
                onChange={onInputChange}
                placeholder={placeholder}
                ref={ref}
              />
            )}
            {/* it will always contain 1 because of the group label */}
            {isLoadingData && (
              <FeedBackContainer>
                <Spinner size="small" />
                <span style={{ marginLeft: '10px' }}>loading results</span>
              </FeedBackContainer>
            )}
            {/* show options if they exist*/}
            {hasOptions && options}
            {/* Add an infinite scroll component add the bottom when there is data, and we are not already loading */}
            {hasOptions && !isLoadingData && (
              <InfiniteScroll
                isFetching={isFetching}
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
              />
            )}
            {/* Basically first interaction */}
            {!hasOptions && inputValue.value === '' && handleInputValueChange && (
              <FeedBackContainer>Start typing to search</FeedBackContainer>
            )}
            {/* When there is no result */}
            {!hasOptions && !isLoadingData && <FeedBackContainer>No results found</FeedBackContainer>}
          </SelectContainer>
        </FloatingFocusManager>
      );
    };

    const options = useMemo(() => {
      return [
        /* this is needed, but we need to get rid of the items that are already present in the options that were actually loaded
        persistedItems.length > 0 && (
          <ul key={`selected-items-${name}`} role="group" aria-labelledby={'select-items-list'}>
            <GroupLabel role="presentation" id={'select-group-label'} aria-hidden="false">
              Selected items
            </GroupLabel>
            {persistedItems.map((item) => (
              <Option key={`${name}-${item.value}`} value={item.value} label={item.label} onChange={onChange as any}>
                {item.label}
              </Option>
            ))}
          </ul>
        ),
        */

        ...(Children.map(
          // children here is an <OptionGroup/>
          children,
          (child) =>
            isValidElement(child) && (
              <ul
                key={(child as ReactElement<OptionGroupProps>).props.label}
                role="group"
                aria-labelledby={`select-${(child as ReactElement<OptionGroupProps>).props.label}`}
              >
                {(child as ReactElement<OptionGroupProps>).props.label && (
                  <GroupLabel
                    role="presentation"
                    id={`select-${(child as ReactElement<OptionGroupProps>).props.label}`}
                    aria-hidden="true"
                  >
                    {(child as ReactElement<OptionGroupProps>).props.label}
                  </GroupLabel>
                )}
                {Children.map((child as ReactElement<OptionGroupProps>).props.children, (option) => {
                  return cloneElement(option as any, {
                    onChange: onChange,
                  });
                })}
              </ul>
            ),
        )?.filter(Boolean) ?? []),
      ];
    }, [children, persistedItems]);

    return (
      <SelectContext.Provider
        value={{
          listRef: listItemsRef,
          setOpen,
          getItemProps,
          setActiveIndex,
          activeIndex,
          dataRef: context.dataRef,
          multiple,
          selectedItems: currentSelectedItems,
          setSelectedItems: setCurrentSelectedItems,
          name,
        }}
      >
        <SelectButton
          id={id}
          ref={refs.setReference}
          disabled={disabled}
          readOnly={readOnly}
          onBlur={onBlur}
          onFocus={onFocus}
          isOpen={open}
          tabIndex={disabled ? -1 : 0}
          hasError={hasError}
          aria-describedby={setAriaDescribedBy(name, hasDescription)}
          {...getReferenceProps()}
        >
          {render ? (
            render(currentSelectedItems)
          ) : (
            <div>
              {currentSelectedItems.length === 0 ? 'Select' : currentSelectedItems.map((item) => item.label).join(', ')}
            </div>
          )}

          {!readOnly && canClear && currentSelectedItems.length > 0 && !open ? (
            <IconButton size="tiny" icon={<ClearIcon />} ariaLabel="clear" onClick={(e) => handleClear(e)} />
          ) : (
            <StyledArrowIcon size={16} />
          )}
        </SelectButton>
        {open && <FloatingPortal>{renderSelect()}</FloatingPortal>}
      </SelectContext.Provider>
    );
  },
);

// TODO: type it correctly instead
type GenericSelectQueryFieldType = typeof _GenericSelectQueryField & SubComponentTypes;
export const GenericSelectQueryField = _GenericSelectQueryField as GenericSelectQueryFieldType;

GenericSelectQueryField.Option = Option;
GenericSelectQueryField.OptionGroup = OptionGroup;
