import { forwardRef, MutableRefObject, useState } from 'react';
import { Button } from '../../components';
import {
  Container,
  Header,
  ActionContainer,
  Cancel,
  Description,
} from './style';
import { useLockBodyScroll } from '../../hooks';
import { AiOutlineClose as Close } from 'react-icons/ai';
import { AlertVariants } from '../../styled';

export interface ConfirmationModalProps {
  title: string;
  description?: string;
  action: () => unknown;
  actionText: string;
  icon?: React.ReactNode;
  close: () => void;
  ref: MutableRefObject<HTMLDivElement>;
  type?: AlertVariants;
}

export const ConfirmationModal = forwardRef<
  HTMLDivElement,
  ConfirmationModalProps
>(({ title, description, action, close, actionText, type = 'info' }, ref) => {
  useLockBodyScroll();
  const [loading, setLoading] = useState<boolean>(false);

  async function confirmAction(): Promise<void> {
    setLoading(true);
    await action();
    setLoading(false);
    close();
  }

  return (
    <Container aria-describedby={description} aria-labelledby={title} ref={ref}>
      <Header type={type}>
        <h2>{title}</h2>
        <Close onClick={close} size={18} style={{ cursor: 'pointer' }} />
      </Header>
      <Description>{description}</Description>
      <ActionContainer type={type}>
        <Cancel onClick={close}>Cancel</Cancel>
        <Button
          color={type}
          isLoading={loading}
          onClick={confirmAction}
          size="medium"
          text={actionText}
        />
      </ActionContainer>
    </Container>
  );
});
