import {
  useClick,
  useDismiss,
  useInteractions,
  useFloating,
  autoUpdate,
  offset,
} from '@floating-ui/react';
import { FC } from 'react';
import { styled } from '../../../styled';

const FloatingContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  box-shadow: ${({ theme }) => theme.elevation[3]};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const ReferenceContainer = styled.div`
  width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface Dropdown {
  renderFloating: JSX.Element;
  renderReference: JSX.Element;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const Dropdown: FC<Dropdown> = ({
  renderFloating,
  renderReference,
  open,
  setOpen,
}) => {
  const { x, y, strategy, refs, context } = useFloating<HTMLDivElement>({
    open,
    onOpenChange: setOpen,
    placement: 'bottom',
    middleware: [offset({ mainAxis: 2 })],
    whileElementsMounted: autoUpdate,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
  ]);

  return (
    <>
      <ReferenceContainer
        ref={refs.setReference}
        {...getReferenceProps({
          onClick(event) {
            event.stopPropagation();
          },
        })}
      >
        {renderReference}
      </ReferenceContainer>
      {open && (
        <FloatingContainer
          ref={refs.setFloating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
          }}
          {...getFloatingProps()}
        >
          {renderFloating}
        </FloatingContainer>
      )}
    </>
  );
};
