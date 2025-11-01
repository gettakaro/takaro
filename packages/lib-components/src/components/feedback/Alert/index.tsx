import { forwardRef, isValidElement, MouseEvent, ReactElement, useState } from 'react';
import { Container, Grid, IconContainer, ButtonContainer } from './style';
import {
  AiFillCheckCircle as Success,
  AiFillCloseCircle as Error,
  AiOutlineWarning as Warning,
  AiFillInfoCircle as Info,
} from 'react-icons/ai';
import { AnimatePresence } from 'framer-motion';
import { Elevation } from '../../../styled/';
import { Button } from '../../../components';

export type AlertVariants = 'success' | 'error' | 'warning' | 'info';

type Action = {
  execute: () => void;
  text: string;
};

export interface AlertProps {
  variant: AlertVariants;
  title?: string;
  text?: string | string[] | ReactElement;
  elevation?: Elevation;
  dismiss?: boolean;
  action?: Action;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { variant, title, text, dismiss = false, elevation = 2, action },
  ref,
) {
  const [visible, setVisible] = useState(true);
  const hasTitle = !!title;
  const hasText = !!text;
  const hasContent = hasTitle || hasText;
  // Use center alignment when we have only one content line (title OR text, not both)
  // Use start alignment when we have multiple lines (title AND text, or text as an array)
  const useStartAlignment = (hasTitle && hasText) || Array.isArray(text);

  const handleExecute = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    action?.execute();
  };
  const handleDismiss = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setVisible(false);
  };

  function getIcon() {
    switch (variant) {
      case 'success':
        return <Success size={24} />;
      case 'error':
        return <Error size={24} />;
      case 'warning':
        return <Warning size={24} />;
      case 'info':
        return <Info size={24} />;
    }
  }

  function renderText() {
    if (isValidElement(text)) {
      return text;
    }

    if (typeof text === 'string') {
      return <p>{text}</p>;
    } else if (Array.isArray(text)) {
      return <ul>{text?.map((message, index) => <li key={index}>{message}</li>)}</ul>;
    }
  }

  // Determine ARIA role based on variant
  const getAriaRole = () => {
    return variant === 'error' || variant === 'warning' ? 'alert' : 'status';
  };

  const getAriaLive = () => {
    return variant === 'error' || variant === 'warning' ? 'assertive' : 'polite';
  };

  return (
    <AnimatePresence>
      {visible && (
        <Container
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          $hasTitle={hasTitle}
          initial={{ opacity: 0 }}
          $variant={variant}
          $elevation={elevation}
          transition={{ duration: 0.2 }}
          ref={ref}
          role={getAriaRole()}
          aria-live={getAriaLive()}
          aria-atomic="true"
        >
          <Grid $useStartAlignment={useStartAlignment}>
            <IconContainer variant={variant}>{getIcon()}</IconContainer>
            {title && <h2>{title}</h2>}
            {renderText()}
            <ButtonContainer hasContent={hasContent} show={!!(dismiss || action)} variant={variant} className="action">
              {action && (
                <Button size="small" variant="outline" onClick={handleExecute} color={variant}>
                  {action.text}
                </Button>
              )}
              {dismiss && (
                <Button size="small" color="white" variant="outline" onClick={handleDismiss}>
                  Dismiss
                </Button>
              )}
            </ButtonContainer>
          </Grid>
        </Container>
      )}
    </AnimatePresence>
  );
});
