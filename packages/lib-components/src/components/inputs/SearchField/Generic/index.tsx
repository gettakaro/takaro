import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  Children,
  PropsWithChildren,
  isValidElement,
  cloneElement,
  ReactNode,
  useMemo,
} from 'react';
import {
  autoUpdate,
  FloatingFocusManager,
  FloatingPortal,
  size,
  useDismiss,
  useFocus,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
  offset,
} from '@floating-ui/react';
import { defaultInputProps, defaultInputPropsFactory, GenericInputProps } from '../../InputProps';
import { useDebounce } from '../../../../hooks';
import { setAriaDescribedBy } from '../../layout';
import { SearchFieldContext } from './context';
import { Input, LoadingIcon, LoadingContainer } from '../style';

/* The SearchField depends on a few things of <Select/> */
import { GroupLabel, SelectContainer } from '../../Select/style';
import { Spinner } from '../../../../components';

export interface SearchFieldProps {
  // Enables loading data feedback for user
  isLoadingData?: boolean;

  /// Not implemented: icon to show in the input field
  icon?: ReactNode;

  /// The placeholder text to show when the input is empty
  placeholder?: string;

  /// Debounce time in milliseconds (when clientside data it should be 0)
  debounce: number;

  /// Triggered whenever the input value changes, debounced by 0.5 seconds.
  /// This is used to trigger the API call to get the new options
  handleInputValueChange: (value: string) => void;
}

export interface Item {
  value: string;
  label: string;
}

export interface InputValue {
  value: string;
  label: string;
  /// When the user selects an option from the list, there is no need to do another API call
  shouldUpdate: boolean;
}

export type GenericSearchFieldProps = PropsWithChildren<GenericInputProps<string, HTMLInputElement> & SearchFieldProps>;
const defaultsApplier = defaultInputPropsFactory<GenericSearchFieldProps>(defaultInputProps);

export const GenericSearchField = forwardRef<HTMLInputElement, GenericSearchFieldProps>((props, ref) => {
  const {
    onBlur = () => {},
    onFocus = () => {},
    onChange,
    name,
    disabled,
    required,
    placeholder = 'Search field',
    hasDescription,
    hasError,
    children,
    readOnly,
    debounce = 250,
    isLoadingData: isLoading = false,
    handleInputValueChange,
  } = defaultsApplier(props);

  const [open, setOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<InputValue>({ value: '', shouldUpdate: false, label: '' });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const debouncedValue = useDebounce(inputValue.value, debounce);
  const listItemsRef = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    if (debouncedValue && inputValue.shouldUpdate) handleInputValueChange(debouncedValue);
  }, [debouncedValue]);

  useEffect(() => {
    // TODO: this is not perfect, it will not check if the current value in the input is a valid option.
    if (open === false && inputValue.shouldUpdate == false) {
      const event = {
        target: { value: inputValue.value, name },
        preventDefault: () => {},
        stopPropagation: () => {},
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange(event);

      // the user has typed but did not select an option from the list.
    } else if (open === false && inputValue.shouldUpdate) {
      setInputValue({ value: '', shouldUpdate: false, label: '' });
    }
  }, [open, inputValue, name, onChange]);

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
    useRole(context, { role: 'listbox' }),
    useDismiss(context),
    useFocus(context, { enabled: open }),
    useListNavigation(context, {
      listRef: listItemsRef,
      onNavigate: setActiveIndex,
      focusItemOnHover: false,
      loop: true,
      activeIndex,
    }),
  ]);

  function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    setInputValue({ value, shouldUpdate: true, label: value });

    if (value) {
      setOpen(true);
      // automatically select the first item in the list (because this should be the best match)
      setActiveIndex(0);
    } else {
      setOpen(false);
    }
  }

  const renderSelect = () => {
    const hasOptions = Children.count(options[0].props.children) > 1;
    return (
      <FloatingFocusManager context={context} initialFocus={-1} visuallyHiddenDismiss>
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
          {/* it will always contain 1 because of the group label */}
          {isLoading && (
            <LoadingContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <Spinner size="small" />
              <span style={{ marginLeft: '10px' }}>loading results</span>
            </LoadingContainer>
          )}
          {hasOptions && options}
          {!hasOptions && !isLoading && <div style={{ textAlign: 'center' }}>No results found</div>}
        </SelectContainer>
      </FloatingFocusManager>
    );
  };

  const options = useMemo(() => {
    let optionIndex = 0;
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
              {Children.map(child.props.children, (child) =>
                cloneElement(child, {
                  index: 1 + optionIndex++,
                })
              )}
            </ul>
          )
      ) ?? []),
    ];
  }, [children]);

  return (
    <SearchFieldContext.Provider
      value={{
        listRef: listItemsRef,
        setOpen,
        getItemProps,
        setActiveIndex,
        activeIndex,
        setInputValue,
        inputValue: inputValue,
        dataRef: context.dataRef,
      }}
    >
      <div ref={ref} style={{ position: 'relative' }}>
        <Input
          hasError={hasError}
          isLoading={isLoading}
          {...getReferenceProps({
            ref: refs.setReference,
            onChange: onInputChange,
            value: inputValue.label,
            placeholder: placeholder,
            name: name,
            onBlur: onBlur,
            onFocus: onFocus,
            readOnly: readOnly,
            disabled: disabled,
            autoComplete: 'off',
            'aria-describedby': setAriaDescribedBy(name, hasDescription),
            'aria-autocomplete': 'list',
            'aria-required': required,
            onKeyDown: (e) => {
              if (e.ctrlKey && e.key === ' ') {
                e.preventDefault();
                setOpen(true);
              }
            },
          })}
        />
        {isLoading && (
          <LoadingIcon>
            <Spinner size="small" />
          </LoadingIcon>
        )}

        {open && !readOnly && <FloatingPortal>{renderSelect()}</FloatingPortal>}
      </div>
    </SearchFieldContext.Provider>
  );
});
