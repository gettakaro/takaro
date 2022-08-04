import { cloneElement, ReactElement, forwardRef } from 'react';
import { Container, Action } from './style';

interface IAction {
  icon: ReactElement;
  text: string;
  onClick: () => any;
}

export interface ActionMenuProps {
  title?: string;
  actions: IAction[];
  popperAttributes: any;
  popperStyles: any;
}

export const ActionMenu = forwardRef<HTMLUListElement, ActionMenuProps>(
  ({ title = '', actions, popperAttributes, popperStyles }, ref) => {
    return (
      <Container
        transition={{ duration: 0.5 }}
        {...popperAttributes.popper}
        ref={ref}
        style={popperStyles.popper}
      >
        {title && <h3>{title}</h3>}
        {actions.map(({ icon, onClick, text }) => (
          <Action onClick={onClick}>
            {cloneElement(icon, { size: 20 })}
            <p>{text}</p>
          </Action>
        ))}
      </Container>
    );
  }
);
