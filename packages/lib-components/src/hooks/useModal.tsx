import { FC, PropsWithChildren, ReactNode, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { styled } from '../styled';
import { motion } from 'framer-motion';

export const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #00000080;
  align-items: center;
  justify-content: center;
  display: flex;
  overflow: hidden;
  z-index: 1000; /* Should show above everything. */
`;

export const Container = styled(motion.div)`
  position: relative;
  min-height: 200px;
  max-height: 750px;
  background-color: white;
  padding: ${({ theme }) =>
    `${theme.spacing['2_5']} ${theme.spacing['2_5']} ${theme.spacing['1']} ${theme.spacing['2_5']}`};
  box-shadow: ${({ theme }) => theme.elevation[3]}
  border-radius: ${({ theme }) => theme.borderRadius.large};
  p {
    text-align: left;
    margin-top: ${({ theme }) => theme.spacing['1']} ;
  }
`;

export interface ModalProps {
  isOpen?: boolean;
  elementId: string;
}

const Modal: FC<PropsWithChildren<ModalProps>> = ({
  children,
  isOpen = false,
  elementId,
}) => {
  if (!isOpen) {
    return null;
  }

  return createPortal(
    <Overlay>
      <Container
        animate={{ opacity: 1, top: 0, scale: 1 }}
        initial={{ opacity: 0, top: 150, scale: 0.8 }}
        transition={{ duration: 1, type: 'spring', bounce: 0.6 }}
      >
        {children}
      </Container>
    </Overlay>,
    document.getElementById(elementId) as HTMLElement
  );
};

type Children = { children: ReactNode | ReactNode[] };

export const useModal = (): [
  ({ children }: Children) => JSX.Element,
  () => void,
  () => void
] => {
  const [isOpen, setOpen] = useState(false);

  const open = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const close = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const ModalWrapper = useCallback(
    ({ children }: Children) => (
      <Modal elementId="modal" isOpen={isOpen}>
        {children}
      </Modal>
    ),
    [isOpen]
  );
  return [ModalWrapper, open, close];
};
