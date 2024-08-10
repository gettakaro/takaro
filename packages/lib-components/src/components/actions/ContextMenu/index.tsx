import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  HTMLProps,
  RefObject,
  ReactElement,
  FC,
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
} from '@floating-ui/react';
import { MenuItem, MenuItemProps } from './MenuItem';
import { Group } from './Group';

import { styled } from '../../../styled';

const Container = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  box-shadow: ${({ theme }) => theme.elevation[2]};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  &:focus-visible {
    outline: none;
  }
`;

export interface ContextMenuProps extends HTMLProps<HTMLButtonElement> {
  label?: string;
  nested?: boolean;
  targetRef?: RefObject<HTMLElement>;
}

type SubComponentTypes = {
  Item: typeof MenuItem;
  Group: typeof Group;
};

export const ContextMenu: FC<ContextMenuProps> & SubComponentTypes = ({ children, targetRef }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const listItemsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const listContentRef = useRef(
    Children.map(children, (child) => (isValidElement(child) ? child.props.label : null)) as Array<string | null>,
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
      if (targetRef?.current && targetRef?.current.contains(e.target as Node)) {
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
        <FloatingFocusManager context={context} initialFocus={refs.floating}>
          <Container className="ContextMenu" ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
            {Children.map(children, (child, index) => {
              if (isValidElement(child)) {
                // If child is a Group, iterate over its children
                if (child.type === ContextMenu.Group) {
                  const newGroupChildren = Children.map(
                    child.props.children,
                    (groupChild: ReactElement<MenuItemProps>, groupIndex) => {
                      if (isValidElement(groupChild)) {
                        return cloneElement(
                          groupChild,
                          getItemProps({
                            tabIndex: activeIndex === index ? 0 : -1,
                            ref(node: HTMLButtonElement) {
                              listItemsRef.current[groupIndex] = node;
                            },
                            onClick(e: React.MouseEvent<HTMLButtonElement>) {
                              groupChild.props.onClick?.(e);
                              setIsOpen(false);
                            },
                            onMouseUp(e: React.MouseEvent<HTMLButtonElement>) {
                              groupChild.props.onClick?.(e);
                              setIsOpen(false);
                            },
                          }),
                        );
                      }
                      return groupChild;
                    },
                  );
                  return <ContextMenu.Group {...child.props}>{newGroupChildren}</ContextMenu.Group>;
                }

                // If child is not a Group, handle it as before
                return cloneElement(
                  child,
                  getItemProps({
                    tabIndex: activeIndex === index ? 0 : -1,
                    ref(node: HTMLButtonElement) {
                      listItemsRef.current[index] = node;
                    },
                    onClick(e) {
                      child.props.onClick?.(e);
                      setIsOpen(false);
                    },
                    onMouseUp(e) {
                      child.props.onClick?.(e);
                      setIsOpen(false);
                    },
                  }),
                );
              }
            })}
          </Container>
        </FloatingFocusManager>
      )}
    </FloatingPortal>
  );
};

ContextMenu.Item = MenuItem;
ContextMenu.Group = Group;
