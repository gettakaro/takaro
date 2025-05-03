import { forwardRef, HTMLProps, FC, ReactElement, ReactNode } from 'react';
import {
  useMergeRefs,
  FloatingPortal,
  FloatingFocusManager,
  FloatingList,
  useTransitionStyles,
} from '@floating-ui/react';
import { useDropdownContext } from './DropdownContext';
import { DropdownMenuItem, DropdownMenuItemProps } from './DropdownMenuItem';
import { DropdownMenuGroup } from './DropdownMenuGroup';
import { styled } from '../../../styled';

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border: 0.1rem solid ${({ theme }) => theme.colors.backgroundAccent};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing['0_5']};
`;

interface DropdownMenuProps extends HTMLProps<HTMLDivElement> {
  children: ReactElement<DropdownMenuItemProps> | Array<ReactElement<DropdownMenuItemProps>> | ReactNode;
}

type DropdownMenuComponent = FC<DropdownMenuProps> & {
  Item: typeof DropdownMenuItem;
  Group: typeof DropdownMenuGroup;
};

const DropdownMenuBase = forwardRef<HTMLDivElement, DropdownMenuProps>(function DropdownMenu(
  { children, ...props },
  propRef,
) {
  const { context, floatingStyles, elementsRef, labelsRef, getFloatingProps, descriptionId, labelId } =
    useDropdownContext();

  const ref = useMergeRefs([context.refs.setFloating, propRef]);

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: {
      open: 0,
      close: 100,
    },
    initial: () => ({
      opacity: 0,
      open: { opacity: 1 },
      close: { opacity: 0 },
    }),
  });

  return (
    <FloatingPortal>
      {isMounted && (
        <FloatingFocusManager context={context} modal={false}>
          <Container
            ref={ref}
            style={{ ...transitionStyles, ...floatingStyles }}
            aria-labelledby={labelId}
            aria-describedby={descriptionId}
            {...getFloatingProps(props)}
          >
            <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
              {children}
            </FloatingList>
          </Container>
        </FloatingFocusManager>
      )}
    </FloatingPortal>
  );
});

export const DropdownMenu = DropdownMenuBase as unknown as DropdownMenuComponent;

DropdownMenu.Item = DropdownMenuItem;
DropdownMenu.Group = DropdownMenuGroup;
