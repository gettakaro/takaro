import { forwardRef, MouseEvent, useState } from 'react';
import { Container, Grid, IconContainer, ButtonContainer } from './style';
import {
  AiFillCheckCircle as Success,
  AiFillCloseCircle as Error,
  AiOutlineWarning as Warning,
  AiFillInfoCircle as Info,
} from 'react-icons/ai';
import { AnimatePresence } from 'framer-motion';
import { Elevation } from '../../../styled/';

export type AlertVariants = 'success' | 'error' | 'warning' | 'info';

type Action = {
  execute: () => void;
  text: string;
};

export interface AlertProps {
  variant: AlertVariants;
  title?: string;
  text?: string | string[];
  elevation?: Elevation;
  dismiss?: boolean;
  action?: Action;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ variant, title, text, dismiss = false, elevation = 4, action }, ref) => {
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
            <Grid hasTitle={hasTitle}>
              <IconContainer variant={variant}>{getIcon()}</IconContainer>

              {/* If title is declared set title, otherwise put everything on single line */}
              {title && (
                <>
                  <h2>{title}</h2>
                  <div />
                </>
              )}
              {typeof text === 'string' ? (
                <p>{text}</p>
              ) : (
                text && (
                  <ul>
                    {text.map((message) => (
                      <li>{message}</li>
                    ))}
                  </ul>
                )
              )}
              {hasTitle ? <div /> : null}
              <ButtonContainer hasTitle={hasTitle} show={dismiss || action ? true : false} variant={variant}>
                {action && <button onClick={handleExecute}>{action.text}</button>}
                {dismiss && <button onClick={handleDismiss}>Dismiss</button>}
              </ButtonContainer>
            </Grid>
          </Container>
        )}
      </AnimatePresence>
    );
  }
);
