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
} from 'react';
import {
  autoUpdate,
  FloatingFocusManager,
  FloatingPortal,
  size,
  useDismiss,
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
import { SelectContainer, SelectButton, StyledArrowIcon, StyledFloatingOverlay } from '../../sharedStyle';
import { IconButton, InfiniteScroll, Spinner } from '../../../../../components';
import { GenericTextField } from '../../../TextField/Generic';

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
  /// render inPortal
  inPortal?: boolean;

  /// When true, The select icon will be replaced by a cross icon to clear the selected value.
  canClear?: boolean;

  /// The selected items shown in the select field
  render?: (selectedItems: SelectItem[]) => React.ReactNode;

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

export const GenericSelectQueryField = forwardRef<HTMLInputElement, GenericSelectQueryFieldProps>(
  function GenericSelectQueryField(props, ref) {
    const {
      onBlur = () => {},
      onFocus = () => {},
      onChange,
      name,
      disabled,
      value,
      id,
      placeholder = 'Search field',
      hasDescription,
      inPortal = false,
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
      isLoadingData: isLoading = false,
      handleInputValueChange,
      optionCount,
    } = defaultsApplier(props);

    const [open, setOpen] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<InputValue>({ value: '', shouldUpdate: false, label: '' });
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [selectedItems, setSelectedItems] = useState<SelectItem[]>([]);

    const debouncedValue = useDebounce(inputValue.value, debounce);
    const listItemsRef = useRef<Array<HTMLLIElement | null>>([]);

    useEffect(() => {
      if (handleInputValueChange) {
        if ((inputValue.shouldUpdate && debouncedValue) || (inputValue && debouncedValue === ''))
          handleInputValueChange(debouncedValue);
      }
    }, [debouncedValue]);

    const { refs, strategy, x, y, context } = useFloating<HTMLInputElement>({
      whileElementsMounted: autoUpdate,
      open,
      onOpenChange: readOnly || disabled ? () => {} : setOpen,
      middleware: [
        offset(5),
        size({
          apply({ rects, elements }) {
            Object.assign(elements.floating.style, {
              width: `${rects.reference.width}px`,
              maxHeight: '255px',
            });
          },
          padding: 10,
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
      setSelectedItems([]);

      // the undefined is an expection
      if (onChange) onChange(multiple ? ([] as string[]) : (undefined as any));
    };

    /* This handles the case where the value is changed externally (e.g. from a parent component) */
    /* onChange propagates the value to the parent component, but since the value prop is not a required prop, the parent might not reflect the change
     * which ends up not running this useEffect. Meaning we still need to update the selectedIndex when clicked on an option.
     */
    useEffect(() => {
      // Function to create an item with a value and label
      const createItem = (v: string) => ({ value: v, label: getLabelFromChildren(children, v) as unknown as string });

      if (Array.isArray(value)) {
        const items = value.map(createItem);
        setSelectedItems(items);
      } else if (typeof value === 'string' && value !== '') {
        setSelectedItems([createItem(value)]);
      }
    }, [value, children]);

    const renderSelect = () => {
      const hasOptions = options && Children.count(options[0].props.children) > 1;

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
                borderBottom: '10px solid transparent',
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
                suffix={isLoading ? 'Loading' : optionCount !== undefined ? `Result: ${optionCount}` : undefined}
                hasError={hasError}
                value={inputValue.value}
                onChange={onInputChange}
                placeholder={placeholder}
                ref={ref}
              />
            )}
            {/* it will always contain 1 because of the group label */}
            {isLoading && (
              <FeedBackContainer>
                <Spinner size="small" />
                <span style={{ marginLeft: '10px' }}>loading results</span>
              </FeedBackContainer>
            )}
            {hasOptions && options}
            {hasOptions && !isLoading && (
              <InfiniteScroll
                isFetching={isFetching}
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
              />
            )}
            {/* Basically first interaction */}
            {!hasOptions && inputValue.value === '' && <FeedBackContainer>Start typing to search</FeedBackContainer>}
            {/* When there is no result */}
            {!hasOptions && !isLoading && inputValue.value !== '' && (
              <FeedBackContainer>No results found</FeedBackContainer>
            )}
          </SelectContainer>
        </FloatingFocusManager>
      );
    };

    const options = useMemo(() => {
      return [
        ...(Children.map(
          children,
          (child) =>
            isValidElement(child) && (
              <ul key={child.props.label} role="group" aria-labelledby={`select-${child.props.label}`}>
                {child.props.label && (
                  <GroupLabel role="presentation" id={`select-${child.props.label}`} aria-hidden="true">
                    {child.props.label}
                  </GroupLabel>
                )}
                {Children.map(child.props.children, (option) => {
                  return cloneElement(option, {
                    onChange: onChange,
                  });
                })}
              </ul>
            ),
        ) ?? []),
      ];
    }, [children]);

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
          selectedItems,
          setSelectedItems,
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
            render(selectedItems)
          ) : (
            <div>{selectedItems.length === 0 ? 'Select' : selectedItems.map((item) => item.label).join(', ')}</div>
          )}

          {!readOnly && canClear && selectedItems.length > 0 && !open ? (
            <IconButton size="tiny" icon={<ClearIcon />} ariaLabel="clear" onClick={(e) => handleClear(e)} />
          ) : (
            <StyledArrowIcon size={16} />
          )}
        </SelectButton>
        {open &&
          (!inPortal ? (
            <StyledFloatingOverlay lockScroll style={{ zIndex: 1000 }}>
              {renderSelect()}
            </StyledFloatingOverlay>
          ) : (
            <FloatingPortal>{renderSelect()}</FloatingPortal>
          ))}
      </SelectContext.Provider>
    );
  },
);
