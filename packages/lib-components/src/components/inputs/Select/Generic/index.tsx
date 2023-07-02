import {
  FC,
  Children,
  cloneElement,
  isValidElement,
  useRef,
  useState,
  useLayoutEffect,
  PropsWithChildren,
  useEffect,
  ReactNode,
  useMemo,
} from 'react';
import { SelectContext } from './context';
import {
  GroupLabel,
  SelectButton,
  SelectContainer,
  StyledFloatingOverlay,
  StyledArrowIcon,
} from '../style';

import {
  useFloating,
  offset,
  flip,
  useListNavigation,
  useTypeahead,
  useInteractions,
  useRole,
  useClick,
  useDismiss,
  FloatingFocusManager,
  autoUpdate,
  size,
} from '@floating-ui/react';

import {
  defaultInputPropsFactory,
  defaultInputProps,
  GenericInputProps,
} from '../../InputProps';
import { Option } from './Option';
import { OptionGroup } from './OptionGroup';
import { SubComponentTypes } from '..';
import { setAriaDescribedBy } from '../../layout';

export interface SelectProps {
  render: (selectedIndex: number) => React.ReactNode;
  minWidth?: string;
}

export type GenericSelectProps = PropsWithChildren<
  SelectProps & GenericInputProps<HTMLDivElement>
>;

const defaultsApplier =
  defaultInputPropsFactory<GenericSelectProps>(defaultInputProps);

// TODO: implement required, test error display, add grouped example, implement setShowError
// TODO: implement **required** (but this should only be done after the label reimplementation.
export const GenericSelect: FC<GenericSelectProps> & SubComponentTypes = (
  props
) => {
  const {
    render,
    children,
    readOnly,
    value,
    onBlur,
    onChange,
    id,
    hasError,
    hasDescription,
    name,
  } = defaultsApplier(props);

  const listItemsRef = useRef<Array<HTMLLIElement | null>>([]);
  const listContentRef = useRef([
    'Select...',
    ...(Children.map(children, (child) =>
      Children.map(
        isValidElement(child) && child.props.children,
        (child) => child.props.value
      )
    ) ?? []),
  ]);

  const [open, setOpen] = useState(false);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(() => {
    const defaultIndex = Math.max(0, listContentRef.current.indexOf(value));
    onChange(listContentRef.current[defaultIndex]);
    return defaultIndex;
  });

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
        apply({ rects, availableHeight, elements, availableWidth }) {
          Object.assign(elements.floating.style, {
            width: `${Math.min(rects.reference.width + 25, availableWidth)}px`,
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

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [
      useClick(context),
      useRole(context, { role: 'listbox' }),
      useDismiss(context),
      useListNavigation(context, {
        listRef: listItemsRef,
        activeIndex,
        selectedIndex,
        onNavigate: setActiveIndex,
      }),
      useTypeahead(context, {
        listRef: listContentRef,
        onMatch: open ? setActiveIndex : setSelectedIndex,
        activeIndex,
        selectedIndex,
      }),
    ]
  );

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
  }, []);

  useEffect(() => {
    const index = values.indexOf(value as string);
    if (index !== -1) {
      setSelectedIndex(index + 1);
    }
  }, [value]);

  // Scroll the active or selected item into view when in `controlledScrolling`
  // mode (i.e. arrow key nav).
  useLayoutEffect(() => {
    if (open && activeIndex != null && !pointer) {
      requestAnimationFrame(() => {
        listItemsRef.current[activeIndex]?.scrollIntoView({
          block: 'nearest',
        });
      });
    }
  }, [open, activeIndex, pointer]);

  let optionIndex = 0;

  const options = [
    ...(Children.map(
      children,
      (child) =>
        isValidElement(child) && (
          <ul
            key={child.props.label}
            role="group"
            aria-labelledby={`select-${child.props.label}`}
          >
            {child.props.label && (
              <GroupLabel
                role="presentation"
                id={`select-${child.props.label}`}
                aria-hidden="true"
              >
                {child.props.label}
              </GroupLabel>
            )}
            {Children.map(child.props.children, (child) =>
              cloneElement(child, {
                index: 1 + optionIndex++,
                onChange: onChange,
              })
            )}
          </ul>
        )
    ) ?? []),
  ];

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
      }}
    >
      <SelectButton
        id={id}
        ref={refs.setReference}
        readOnly={readOnly}
        onBlur={onBlur}
        isOpen={open}
        tabIndex={readOnly ? -1 : 0}
        hasError={hasError}
        aria-describedby={setAriaDescribedBy(name, hasDescription)}
        {...getReferenceProps()}
      >
        {render(selectedIndex - 1)}
        {!readOnly && <StyledArrowIcon size={16} />}
      </SelectButton>
      {open && !readOnly && (
        <StyledFloatingOverlay lockScroll style={{ zIndex: 1000 }}>
          <FloatingFocusManager context={context} initialFocus={selectedIndex}>
            <SelectContainer
              ref={refs.setFloating}
              style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                overflow: 'auto',
              }}
              onPointerMove={() => setPointer(true)}
              onKeyDown={(event) => {
                if (event.key === 'Tab') {
                  setOpen(false);
                }
              }}
              {...getFloatingProps()}
            >
              {options}
            </SelectContainer>
          </FloatingFocusManager>
        </StyledFloatingOverlay>
      )}
    </SelectContext.Provider>
  );
};

GenericSelect.Option = Option;
GenericSelect.OptionGroup = OptionGroup;
