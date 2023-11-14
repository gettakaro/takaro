import {
  FC,
  Children,
  cloneElement,
  isValidElement,
  useRef,
  useState,
  PropsWithChildren,
  useEffect,
  ReactNode,
  useMemo,
  ReactElement,
} from 'react';
import { SelectContext } from './context';
import { GroupLabel, SelectButton, SelectContainer, StyledFloatingOverlay, StyledArrowIcon } from '../style';
import { FilterInput } from './FilterInput';

import {
  useFloating,
  offset,
  flip,
  useListNavigation,
  useInteractions,
  useRole,
  useClick,
  useDismiss,
  FloatingFocusManager,
  autoUpdate,
  size,
  FloatingPortal,
} from '@floating-ui/react';

import { defaultInputPropsFactory, defaultInputProps, GenericInputProps } from '../../InputProps';
import { Option } from './Option';
import { OptionGroup } from './OptionGroup';
import { SubComponentTypes } from '..';
import { setAriaDescribedBy } from '../../layout';

interface MultiSelectProps {
  render: (selectIndex: number[]) => React.ReactNode;
  multiSelect: true;
  enableFilter?: boolean;
  /// Rendering in portal will render the selectDropdown independent from its parent container.
  /// this is useful when select is rendered in other floating elements with limited space.
  inPortal?: boolean;
}

interface SingleSelectProps {
  render: (selectIndex: number) => React.ReactNode;
  multiSelect?: false;
  enableFilter?: boolean;
  /// Rendering in portal will render the selectDropdown independent from its parent container.
  /// this is useful when select is rendered in other floating elements with limited space.
  inPortal?: boolean;
}

export type SelectProps = MultiSelectProps | SingleSelectProps;
export type GenericSelectProps = PropsWithChildren<SelectProps & GenericInputProps<string, HTMLDivElement>>;

const defaultsApplier = defaultInputPropsFactory<GenericSelectProps>(defaultInputProps);

// TODO: implement required, test error display, add grouped example, implement setShowError
// TODO: implement **required** (but this should only be done after the label reimplementation.
export const GenericSelect: FC<GenericSelectProps> & SubComponentTypes = (props) => {
  const {
    render,
    children,
    readOnly,
    value,
    onBlur,
    onFocus,
    onChange,
    id,
    hasError,
    hasDescription,
    name,
    inPortal = true,
    enableFilter = false,
    multiSelect = false,
  } = defaultsApplier(props);

  const listItemsRef = useRef<Array<HTMLLIElement | null>>([]);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | number[]>(() => {
    // if the select is a multiSelect, the default value should be an empty array.
    if (multiSelect) {
      return [];
    }
    return -1;
  });

  const [filterText, setFilterText] = useState<string>('');
  const filterInputRef = useRef<HTMLInputElement>(null);

  const [pointer, setPointer] = useState(false);

  if (!open && pointer) {
    setPointer(false);
  }

  const { x, y, refs, strategy, context } = useFloating({
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(5),
      size({
        apply({ availableHeight, elements, availableWidth }) {
          const refWidth = elements.reference.getBoundingClientRect().width;

          Object.assign(elements.floating.style, {
            // Note: we cannot use the rects.reference.width here because if the referenced item is very small compared to the other options, there will be horizontal overflow.
            // fit-content isn't the perfect solution either, because if there is no space available it might render outside the viewport.
            width: availableWidth < refWidth ? `${availableWidth}px` : `${refWidth}px`,
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
    useListNavigation(context, {
      listRef: listItemsRef,
      activeIndex: activeIndex,
      selectedIndex: multiSelect ? null : (selectedIndex as number),
      onNavigate: setActiveIndex,
      scrollItemIntoView: multiSelect ? false : true,
    }),
  ]);

  const values = useMemo(() => {
    return (
      Children.map(children, (child) => {
        if (!isValidElement(child)) return;
        return Children.map(child.props.children, (child: ReactNode) => {
          if (!isValidElement(child)) return;
          return child.props.value as string;
        });
      })?.flat() ?? []
    );
  }, [children]);

  /* This handles the case where the value is changed externally (e.g. from a parent component) */
  /* onChange propagates the value to the parent component, but since the value prop is not a required prop, the parent might not reflect the change
   * which ends up not running this useEffect. Meaning we still need to update the selectedIndex when clicked on an option.
   */
  useEffect(() => {
    if (value) {
      if (multiSelect) {
        if (Array.isArray(value)) {
          // convert value to values since it is an array of values
          const valuesThatNeedToBeSelected = value as unknown as string[];

          // get the indices of the values that need to be selected
          const indices = valuesThatNeedToBeSelected.map((value) => values.indexOf(value));

          // set these indices as the selected indices
          setSelectedIndex(indices);
        }
      } else {
        // Selected value is singular value
        // get the index of the value
        const index = values.indexOf(value);

        // if the index is -1, the value is not in the list of values
        // if the index is not -1, set the index as the selected index
        // Otherwise we should set the selected index to null
        // TODO: when set value is not in the list of values, we should throw an error.
        if (index === -1) {
          throw new Error('The value that is set is not in the list of values');
        }

        // for now just set the selected index to null (this should result in an empty select)
        setSelectedIndex(index);
      }
    }
  }, [value, values]);

  const options = useMemo(() => {
    let optionIndex = -1;

    return Children.map(children, (group) => {
      if (!isValidElement(group)) return null;

      const filteredOptions = Children.toArray(group.props.children)
        .filter(isValidElement) // Ensures that only valid elements are processed
        .filter((option: ReactElement) => {
          if (enableFilter && !('label' in option.props)) {
            throw new Error('When enableFilter is true, all options must have a label prop');
          }

          // Perform the filtering based on your condition
          const valueMatches = filterText === '' || option.props.label.toLowerCase().includes(filterText.toLowerCase());
          return valueMatches;
        })
        .map((option: ReactElement) => {
          // Increment optionIndex only for options that match
          optionIndex++;

          // Make sure your Option component can accept and use the index prop
          return cloneElement(option, {
            index: optionIndex,
            onChange: onChange,
          });
        });

      if (filteredOptions.length === 0) return null;

      return (
        <ul key={group.props.label} role="group" aria-labelledby={`select-${group.props.label}`}>
          {group.props.label && (
            <GroupLabel role="presentation" id={`select-${group.props.label}`} aria-hidden="true">
              {group.props.label}
            </GroupLabel>
          )}
          {filteredOptions}
        </ul>
      );
    });
  }, [children, onChange, filterText]);

  useEffect(() => {
    // clear filter when dropdown is closed
    if (!open) {
      setFilterText('');
    }
    // focus on the filter input when the dropdown is opened
    else {
      filterInputRef.current?.focus();
    }
  }, [open]);

  const renderSelect = () => {
    return (
      <FloatingFocusManager
        context={context}
        initialFocus={multiSelect ? (selectedIndex as number[])[0] : (selectedIndex as number) || filterInputRef}
      >
        <SelectContainer
          ref={refs.setFloating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            overflow: 'auto',
          }}
          onPointerMove={() => setPointer(true)}
          {...getFloatingProps()}
        >
          {enableFilter && <FilterInput ref={filterInputRef} selectName={name} onFilterChange={setFilterText} />}
          {options}
        </SelectContainer>
      </FloatingFocusManager>
    );
  };

  const renderedContent = useMemo(() => {
    if (Array.isArray(selectedIndex)) {
      // sort
      const sorted = selectedIndex.sort((a, b) => a - b);
      // Typescript does not infer the correct type for render here
      return render(sorted as number[] & number);
    } else {
      // Typescript does not infer the correct type for render here
      return render(selectedIndex as number[] & number);
    }
  }, [selectedIndex]);

  return (
    <SelectContext.Provider
      value={{
        selectedIndex,
        setSelectedIndex,
        activeIndex,
        setActiveIndex,
        listRef: listItemsRef,
        setOpen,
        getItemProps,
        dataRef: context.dataRef,
        name,
        multiSelect,
        values,
      }}
    >
      <SelectButton
        id={id}
        ref={refs.setReference}
        readOnly={readOnly}
        onBlur={onBlur}
        onFocus={onFocus}
        isOpen={open}
        tabIndex={readOnly ? -1 : 0}
        hasError={hasError}
        aria-describedby={setAriaDescribedBy(name, hasDescription)}
        {...getReferenceProps()}
      >
        {renderedContent}
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
};

GenericSelect.Option = Option;
GenericSelect.OptionGroup = OptionGroup;
