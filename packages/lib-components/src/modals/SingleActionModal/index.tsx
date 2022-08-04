import { forwardRef, MutableRefObject, useState } from 'react';
import { Container, IconContainer } from './style';
import { AlertVariants } from '../../styled/types';
import { useLockBodyScroll } from '../../hooks';
import { Button } from '../../components';

// different icons
import {
  AiOutlineCheck as CheckMark,
  AiOutlineInfo as Info,
  AiOutlineWarning as Warning,
  AiOutlineAlert as Error
} from 'react-icons/ai';

export interface SingleActionModalProps {
  title: string;
  description?: string;
  action: any;
  actionText: string;
  close: any;
  ref: MutableRefObject<HTMLDivElement>;
  type: AlertVariants;
}

export const SingleActionModal = forwardRef<HTMLDivElement, SingleActionModalProps>(
  ({ action, actionText, title, description, type, close }, ref) => {
    useLockBodyScroll();
    const [loading, setLoading] = useState<boolean>(false);

    async function confirmAction(): Promise<void> {
      setLoading(true);
      await action();
      setLoading(false);
      close();
    }

    function getIcon() {
      switch (type) {
        case 'info':
          return <Info size={24} />;
        case 'success':
          return <CheckMark size={24} />;
        case 'warning':
          return <Warning size={24} />;
        case 'error':
          return <Error size={24} />;
      }
    }

    return (
      <Container ref={ref}>
        <IconContainer type={type}>{getIcon()}</IconContainer>
        <h2>{title}</h2>
        <p>{description}</p>
        <Button
          color={type}
          isLoading={loading}
          onClick={confirmAction}
          size="large"
          text={actionText}
          variant="default"
        />
      </Container>
    );
  }
);
