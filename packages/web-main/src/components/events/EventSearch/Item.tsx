import { forwardRef, useId } from 'react';
import { useTheme } from '@takaro/lib-components';
import { ItemContent } from './style';

type ItemProps = {
  children: React.ReactNode;
  active: boolean;
  onClick?: () => void;
};

export const Item = forwardRef<HTMLDivElement, ItemProps & React.HTMLProps<HTMLDivElement>>(
  ({ children, active, onClick }, ref) => {
    const id = useId();
    const theme = useTheme();

    return (
      <ItemContent
        ref={ref}
        role="option"
        onClick={onClick}
        id={id}
        aria-selected={active}
        style={{
          background: active ? theme.colors['primary'] : 'none',
          padding: `${theme.spacing['0_5']} ${theme.spacing['1']}}`,
          cursor: 'default',
        }}
      >
        {children}
      </ItemContent>
    );
  },
);
