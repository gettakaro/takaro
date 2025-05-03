import { Children, forwardRef, FC, ReactElement, PropsWithChildren } from 'react';
import { Container, Item } from './style';
import { AiOutlineCheck as CheckMarkIcon } from 'react-icons/ai';
import { Elevation } from '../../../styled/';

export interface ActionMenuProps {
  attributes: {
    x: number | null;
    y: number | null;
    strategy: 'absolute' | 'fixed';
  };
  selected: number;
  setSelected: (selected: number) => void;
  children: ReactElement<ActionProps> | Array<ReactElement<ActionProps>>;
  elevation?: Elevation;
}

export const ActionMenu = forwardRef<HTMLUListElement, ActionMenuProps>(function ActionMenu(
  { attributes, children, selected, setSelected, elevation = 4 },
  ref,
) {
  return (
    <Container
      elevation={elevation}
      style={{
        position: attributes.strategy,
        top: attributes.y ? attributes.y + 5 : 0,
        left: attributes.x ?? 0,
      }}
      ref={ref}
    >
      {Children.map(children, (child, idx) => (
        <Item
          aria-disabled={child.props.disabled}
          onClick={() => {
            if (child.props.disabled) {
              return;
            }
            setSelected(idx);
          }}
        >
          {child}
          {selected === idx ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CheckMarkIcon className="checkmark" size={15} />
            </div>
          ) : (
            <div className="checkmark-placeholder" />
          )}
        </Item>
      ))}
    </Container>
  );
});

interface ActionProps extends PropsWithChildren {
  onClick: () => unknown;
  text: string;
  /// Do not use this prop, it is used internally, and should not be exposed.
  disabled?: boolean;
}

export const Action: FC<ActionProps> = ({ children, disabled = false }) => {
  const _ = disabled;
  return children;
};
