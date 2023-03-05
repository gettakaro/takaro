import { forwardRef, MutableRefObject, PropsWithChildren } from 'react';
import { Container, Header } from './style';
import { useLockBodyScroll } from '../../hooks';
import { AiOutlineClose as Close } from 'react-icons/ai';

export interface GenericModalProps {
  title?: string;
  ref: MutableRefObject<HTMLDivElement>;
  close: () => void;
}

export const GenericModal = forwardRef<
  HTMLDivElement,
  PropsWithChildren<GenericModalProps>
>(({ title, children, close }, ref) => {
  useLockBodyScroll();

  return (
    <Container ref={ref}>
      <Header>
        <h2>{title}</h2>
        <Close onClick={close} size={18} style={{ cursor: 'pointer' }} />
      </Header>
      {children}
    </Container>
  );
});
