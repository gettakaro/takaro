import {
  useClick,
  useDismiss,
  useInteractions,
  useFloating,
  autoUpdate,
  offset,
} from '@floating-ui/react';
import { FC, useState } from 'react';
import { styled } from '../../../styled';

const FloatingContainer = styled.div`
  background-color: white;
  box-shadow: ${({ theme }) => theme.elevation[2]};
  padding: ${({ theme }) => theme.spacing['2_5']};
`;

const ReferenceContainer = styled.div`
  width: fit-content;
`;

interface Dropdown {
  renderFloating: JSX.Element;
  renderReference: JSX.Element;
}

export const Dropdown: FC<Dropdown> = ({ renderFloating, renderReference }) => {
  const [open, setOpen] = useState<boolean>(false);

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
      <ReferenceContainer ref={refs.setReference} {...getReferenceProps()}>
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
