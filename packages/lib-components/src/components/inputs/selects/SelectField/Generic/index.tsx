import {
  FC,
  Children,
  cloneElement,
  isValidElement,
  useRef,
  useState,
  PropsWithChildren,
  useEffect,
  useMemo,
  ReactElement,
} from 'react';
import { GroupContainer, GroupLabel } from '../style';
import { SelectContainer, StyledFloatingOverlay, StyledArrowIcon, SelectButton } from '../../sharedStyle';
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

import { defaultInputPropsFactory, defaultInputProps, GenericInputPropsFunctionHandlers } from '../../../InputProps';
import { Option } from '../../Option';
import { OptionGroup } from '../../OptionGroup';
import { setAriaDescribedBy } from '../../../layout';
import { SelectItem, SelectContext, SubComponentTypes } from '../../';

export interface SelectFieldProps {
  enableFilter?: boolean;
  /// Rendering in portal will render the selectDropdown independent from its parent container.
  /// this is useful when select is rendered in other floating elements with limited space.
  inPortal?: boolean;
  render: (selectedItems: SelectItem[]) => React.ReactNode;
  multiSelect?: boolean;
}

export type GenericSelectFieldProps = PropsWithChildren<
  SelectFieldProps & GenericInputPropsFunctionHandlers<SelectItem[], HTMLInputElement>
>;

const defaultsApplier = defaultInputPropsFactory<GenericSelectFieldProps>(defaultInputProps);

// TODO: implement required, test error display, add grouped example, implement setShowError
// TODO: implement **required** (but this should only be done after the label reimplementation.
export const GenericSelectField: FC<GenericSelectFieldProps> & SubComponentTypes = (props) => {
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
    inPortal = false,
    disabled,
    enableFilter = false,
    multiSelect = false,
  } = defaultsApplier(props);

  const listItemsRef = useRef<Array<HTMLLIElement | null>>([]);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectItem[]>([]);

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
      // TODO
      // selectedIndex: multiSelect ? null : (selectedIndex as number),
      onNavigate: setActiveIndex,
      scrollItemIntoView: multiSelect ? false : true,
    }),
  ]);

  /* This handles the case where the value is changed externally (e.g. from a parent component) */
  /* onChange propagates the value to the parent component, but since the value prop is not a required prop, the parent might not reflect the change
   * which ends up not running this useEffect. Meaning we still need to update the selectedIndex when clicked on an option.
   */
  useEffect(() => {
    // ensure that the values arrays is fully populated
    if (value && value.length === 0) {
      setSelectedItems([]);
    }
    if (value) {
      // add values that are in value (from the parent component) but potentially not in selectedValues
      const newItems = selectedItems.filter((item) => !value.map((v) => v.value).includes(item.value));
      setSelectedItems((prev) => [...prev, ...newItems]);
    }
  }, [value]);

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
            isGrouped: 'label' in group.props && 'icon' in group.props,
          });
        });

      if (filteredOptions.length === 0) return null;

      return (
        <GroupContainer key={group.props.label} role="group" aria-labelledby={`select-${group.props.label}`}>
          {group.props.label && (
            <GroupLabel role="presentation" id={`select-${group.props.label}`} aria-hidden="true">
              {group.props.icon && group.props.icon}
              <span key={`select-span-${group.props.label}`}>{group.props.label}</span>
            </GroupLabel>
          )}
          {filteredOptions}
        </GroupContainer>
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
        // TODO
        // initialFocus={selectedItems && selectedItems.length > 0 ? selectedItems[0].label : filterInputRef}
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

  return (
    <SelectContext.Provider
      value={{
        selectedItems,
        setSelectedItems,
        activeIndex,
        setActiveIndex,
        listRef: listItemsRef,
        setOpen,
        getItemProps,
        dataRef: context.dataRef,
        name,
        multiSelect,
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
        {render(selectedItems)}
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

GenericSelectField.Option = Option;
GenericSelectField.OptionGroup = OptionGroup;
