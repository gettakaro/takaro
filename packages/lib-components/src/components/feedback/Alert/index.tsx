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
  showIcon?: boolean;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { variant, title, text, dismiss = false, elevation = 4, action, showIcon = true },
  ref,
) {
  const [visible, setVisible] = useState(true);

  const hasTitle = title ? true : false;

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
      return <ul>{text?.map((message) => <li key={'message-' + message}>{message}</li>)}</ul>;
    }
  }

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
          role="status"
        >
          <Grid hasTitle={hasTitle} showIcon={showIcon}>
            {showIcon && <IconContainer variant={variant}>{getIcon()}</IconContainer>}

            {/* If title is declared set title, otherwise put everything on single line */}
            {title && (
              <>
                <h2>{title}</h2>
                <div />
              </>
            )}
            {renderText()}
            {hasTitle ? <div /> : null}
            <ButtonContainer hasTitle={hasTitle} show={dismiss || action ? true : false} variant={variant}>
              {action && (
                <Button size="tiny" variant="outline" onClick={handleExecute} text={action.text} color={variant} />
              )}
              {dismiss && <Button size="tiny" color="white" variant="outline" onClick={handleDismiss} text="Dismiss" />}
            </ButtonContainer>
          </Grid>
        </Container>
      )}
    </AnimatePresence>
  );
});
