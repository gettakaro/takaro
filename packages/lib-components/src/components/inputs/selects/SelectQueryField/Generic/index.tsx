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
  ReactElement,
  useCallback,
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

import { AiOutlineSearch as SearchIcon } from 'react-icons/ai';
import { defaultInputProps, defaultInputPropsFactory, GenericInputPropsFunctionHandlers } from '../../../InputProps';
import { useDebounce } from '../../../../../hooks';
import { setAriaDescribedBy } from '../../../layout';
import { FeedBackContainer } from '../style';
import { SelectItem, SelectContext } from '../../';

/* The SearchField depends on a few things of <Select/> */
import { GroupLabel } from '../../SelectField/style';

import { SelectContainer, SelectButton, StyledArrowIcon, StyledFloatingOverlay } from '../../sharedStyle';
import { Spinner } from '../../../../../components';
import { GenericTextField } from '../../../TextField/Generic';

interface SharedSelectQueryFieldProps {
  // Enables loading data feedback for user
  isLoadingData?: boolean;
  /// The placeholder text to show when the input is empty
  placeholder?: string;
  /// Debounce time in milliseconds (when clientside data it should be 0)
  debounce: number;
  /// Triggered whenever the input value changes, debounced by 0.5 seconds.
  /// This is used to trigger the API call to get the new options
  handleInputValueChange: (value: string) => void;
  /// render inPortal
  inPortal?: boolean;
}

interface SingleSelectQueryFieldProps extends SharedSelectQueryFieldProps {
  multiSelect?: false;
}
interface MultiSelectQueryFieldProps extends SharedSelectQueryFieldProps {
  multiSelect: true;
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

export const GenericSelectQueryField = forwardRef<HTMLInputElement, GenericSelectQueryFieldProps>((props, ref) => {
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
    multiSelect = false,
    debounce = 250,
    isLoadingData: isLoading = false,
    handleInputValueChange,
  } = defaultsApplier(props);

  const [open, setOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<InputValue>({ value: '', shouldUpdate: false, label: '' });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectItem[]>([]);

  const debouncedValue = useDebounce(inputValue.value, debounce);
  const listItemsRef = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    if (debouncedValue && inputValue.shouldUpdate) handleInputValueChange(debouncedValue);
  }, [debouncedValue]);

  const { refs, strategy, x, y, context } = useFloating<HTMLInputElement>({
    whileElementsMounted: autoUpdate,
    open,
    onOpenChange: setOpen,
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

  const getLabel = useCallback(
    (value: string) => {
      return Children.map(children, (group) => {
        if (!isValidElement(group)) return null;

        const matchedOption = Children.toArray(group.props.children)
          .filter(isValidElement) // Ensures that only valid elements are processed
          .find((option: ReactElement) => {
            return option.props.value === value;
          });

        if (matchedOption) {
          return (matchedOption as ReactElement).props.label;
        }
        return null;
      });
    },
    [children]
  );

  /* This handles the case where the value is changed externally (e.g. from a parent component) */
  /* onChange propagates the value to the parent component, but since the value prop is not a required prop, the parent might not reflect the change
   * which ends up not running this useEffect. Meaning we still need to update the selectedIndex when clicked on an option.
   */
  useEffect(() => {
    // Function to create an item with a value and label
    const createItem = (v: any) => ({ value: v, label: getLabel(v) as unknown as string });

    // Handle both string and string[] types of 'value'
    const newSelectedItems = Array.isArray(value)
      ? value.map(createItem)
      : typeof value === 'string'
      ? [createItem(value)]
      : [];

    setSelectedItems(newSelectedItems);
  }, [value, getLabel]);

  const renderSelect = () => {
    const hasOptions = options && Children.count(options[0].props.children) > 2;

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
          <GenericTextField
            id={`${name}-input`}
            name={`${name}-input`}
            hasDescription={false}
            icon={<SearchIcon />}
            hasError={hasError}
            value={inputValue.value}
            onChange={onInputChange}
            placeholder={placeholder}
            ref={ref}
          />
          {/* it will always contain 1 because of the group label */}
          {isLoading && (
            <FeedBackContainer>
              <Spinner size="small" />
              <span style={{ marginLeft: '10px' }}>loading results</span>
            </FeedBackContainer>
          )}
          {hasOptions && options}
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
          )
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
        multiSelect,
        selectedItems,
        setSelectedItems,
        name,
      }}
    >
      <SelectButton
        id={id}
        ref={refs.setReference}
        readOnly={readOnly}
        onBlur={onBlur}
        onFocus={onFocus}
        isOpen={open}
        tabIndex={disabled ? -1 : 0}
        hasError={hasError}
        aria-describedby={setAriaDescribedBy(name, hasDescription)}
        {...getReferenceProps()}
      >
        <div>{selectedItems.length === 0 ? 'Select' : selectedItems.map((item) => item.label).join(', ')}</div>
        {!readOnly && <StyledArrowIcon size={16} />}
      </SelectButton>
      {open &&
        !readOnly &&
        (!inPortal ? (
          <StyledFloatingOverlay lockScroll style={{ zIndex: 1000 }}>
            {renderSelect()}
          </StyledFloatingOverlay>
        ) : (
          <FloatingPortal>{renderSelect()}</FloatingPortal>
        ))}
    </SelectContext.Provider>
  );
});
