import { forwardRef, HTMLProps, Ref } from 'react';
import { useMergeRefs, FloatingPortal, FloatingFocusManager, FloatingList } from '@floating-ui/react';
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

export const DropdownMenu = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(
  ({ style, children, ...props }, propRef) => {
    const { context, floatingStyles, elementsRef, labelsRef, getFloatingProps, descriptionId, labelId, open } =
      useDropdownContext();
    const ref = useMergeRefs([context.refs.setFloating, propRef]);

    return (
      <FloatingPortal>
        {open && (
          <FloatingFocusManager context={context} modal={false}>
            <Container
              ref={ref}
              style={{ ...floatingStyles, ...style }}
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
  }
) as unknown as DropdownMenuComponent;

DropdownMenu.Item = DropdownMenuItem;
DropdownMenu.Group = DropdownMenuGroup;
