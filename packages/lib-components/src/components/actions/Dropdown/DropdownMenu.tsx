import { forwardRef, HTMLProps, Ref } from 'react';
import {
  useMergeRefs,
  FloatingPortal,
  FloatingFocusManager,
  FloatingList,
  useTransitionStyles,
} from '@floating-ui/react';
import { useDropdownContext } from './DropdownContext';
import { DropdownMenuItem } from './DropdownMenuItem';
import { DropdownMenuGroup } from './DropdownMenuGroup';
import { styled } from '../../../styled';

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border: 0.1rem solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing['0_5']};
`;

type DropdownMenuComponent = {
  (props: HTMLProps<HTMLDivElement>, ref: Ref<HTMLButtonElement>): JSX.Element;
  Item: typeof DropdownMenuItem;
  Group: typeof DropdownMenuGroup;
};

export const DropdownMenu = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(({ children, ...props }, propRef) => {
  const { context, floatingStyles, elementsRef, labelsRef, getFloatingProps, descriptionId, labelId } =
    useDropdownContext();

  const ref = useMergeRefs([context.refs.setFloating, propRef]);

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: {
      open: 0,
      close: 100,
    },
    initial: ({ side }) => ({
      opacity: 0,
      transform: {
        top: 'translateY(5px)',
        bottom: 'translateY(-5px)',
        right: 'translateX(-5px)',
        left: 'translateX(5px)',
      }[side],
      open: { opacity: 1, transform: 'translate(0)' },
      close: { opacity: 0, transform: 'scale(0.8)' },
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
}) as unknown as DropdownMenuComponent;

DropdownMenu.Item = DropdownMenuItem;
DropdownMenu.Group = DropdownMenuGroup;
