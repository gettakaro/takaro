import { FC, useState } from 'react';
import { Container, Grid, IconContainer, ButtonContainer } from './style';
import {
  AiFillCheckCircle as Success,
  AiFillCloseCircle as Error,
  AiOutlineWarning as Warning,
  AiFillInfoCircle as Info
} from 'react-icons/ai';
import { AnimatePresence } from 'framer-motion';

export type AlertVariants = 'success' | 'error' | 'warning' | 'info';

type Action = {
  execute: () => void;
  text: string;
};

export interface AlertProps {
  variant: AlertVariants;
  title: string;
  text: string | string[];
  dismiss?: boolean;
  action?: Action;
}

export const Alert: FC<AlertProps> = ({ variant, title, text, dismiss = false, action }) => {
  const [visible, setVisible] = useState(true);

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
          hasTitle={title ? true : false}
          initial={{ opacity: 0 }}
          variant={variant}
        >
          <Grid>
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
              <ul>
                {text.map((message) => (
                  <li>{message}</li>
                ))}
              </ul>
            )}
            <div />
            <ButtonContainer show={dismiss || action ? true : false} variant={variant}>
              {action && <button onClick={() => action.execute()}>{action.text}</button>}
              {dismiss && <button onClick={() => setVisible(false)}>Dismiss</button>}
            </ButtonContainer>
          </Grid>
        </Container>
      )}
    </AnimatePresence>
  );
};
