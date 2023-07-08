import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useRef,
  useState,
  HTMLProps,
  RefObject,
} from 'react';
import {
  useFloating,
  autoUpdate,
  flip,
  offset,
  shift,
  useRole,
  useDismiss,
  useInteractions,
  useListNavigation,
  useTypeahead,
  FloatingPortal,
  FloatingFocusManager,
  FloatingOverlay,
} from '@floating-ui/react';
import { MenuItem } from './MenuItem';

export interface ContextMenuProps extends HTMLProps<HTMLButtonElement> {
  label?: string;
  nested?: boolean;
  targetRef?: RefObject<HTMLElement>;
}

type ContextMenuComponent = {
  (props: ContextMenuProps, ref: React.Ref<HTMLButtonElement>): JSX.Element;
  Item: typeof MenuItem;
};

export const ContextMenu = forwardRef<HTMLButtonElement, ContextMenuProps>(({ children, targetRef }, _ref) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const listItemsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const listContentRef = useRef(
    Children.map(children, (child) => (isValidElement(child) ? child.props.label : null)) as Array<string | null>
  );
  const allowMouseUpCloseRef = useRef(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset({ mainAxis: 5, alignmentAxis: 4 }),
      flip({
        fallbackPlacements: ['left-start'],
      }),
      shift({ padding: 10 }),
    ],
    placement: 'right-start',
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
  });

  const role = useRole(context, { role: 'menu' });
  const dismiss = useDismiss(context);
  const listNavigation = useListNavigation(context, {
    listRef: listItemsRef,
    onNavigate: setActiveIndex,
    activeIndex,
  });
  const typeahead = useTypeahead(context, {
    enabled: isOpen,
    listRef: listContentRef,
    onMatch: setActiveIndex,
    activeIndex,
  });

  const { getFloatingProps, getItemProps } = useInteractions([role, dismiss, listNavigation, typeahead]);

  useEffect(() => {
    let timeout: number;

    function onContextMenu(e: MouseEvent) {
      e.preventDefault();

      refs.setPositionReference({
        getBoundingClientRect() {
          return {
            width: 0,
            height: 0,
            x: e.clientX,
            y: e.clientY,
            top: e.clientY,
            right: e.clientX,
            bottom: e.clientY,
            left: e.clientX,
          };
        },
      });

      setIsOpen(true);
      clearTimeout(timeout);

      allowMouseUpCloseRef.current = false;
      timeout = window.setTimeout(() => {
        allowMouseUpCloseRef.current = true;
      }, 300);
    }

    function onMouseUp() {
      if (allowMouseUpCloseRef.current) {
        setIsOpen(false);
      }
    }

    if (targetRef?.current) {
      targetRef.current.addEventListener('contextmenu', onContextMenu);
      targetRef.current.addEventListener('mouseup', onMouseUp);
    } else {
      document.addEventListener('contextmenu', onContextMenu);
      document.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      if (targetRef?.current) {
        targetRef.current.removeEventListener('contextmenu', onContextMenu);
        targetRef.current.removeEventListener('mouseup', onMouseUp);
      } else {
        document.removeEventListener('contextmenu', onContextMenu);
        document.removeEventListener('mouseup', onMouseUp);
      }
      clearTimeout(timeout);
    };
  }, [refs]);

  return (
    <FloatingPortal>
      {isOpen && (
        <FloatingOverlay lockScroll>
          <FloatingFocusManager context={context} initialFocus={refs.floating}>
            <div className="ContextMenu" ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
              {Children.map(
                children,
                (child, index) =>
                  isValidElement(child) &&
                  cloneElement(
                    child,
                    getItemProps({
                      tabIndex: activeIndex === index ? 0 : -1,
                      ref(node: HTMLButtonElement) {
                        listItemsRef.current[index] = node;
                      },
                      onClick() {
                        child.props.onClick?.();
                        setIsOpen(false);
                      },
                      onMouseUp() {
                        child.props.onClick?.();
                        setIsOpen(false);
                      },
                    })
                  )
              )}
            </div>
          </FloatingFocusManager>
        </FloatingOverlay>
      )}
    </FloatingPortal>
  );
}) as unknown as ContextMenuComponent;

ContextMenu.Item = MenuItem;
