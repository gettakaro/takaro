import { Children, forwardRef, FC, ReactElement, PropsWithChildren } from 'react';
import { Container, Item } from './style';
import { AiOutlineCheck as CheckMarkIcon } from 'react-icons/ai';

export interface ActionMenuProps {
  attributes: {
    x: number | null;
    y: number | null;
    strategy: 'absolute' | 'fixed';
  };
  selected: number;
  setSelected: (selected: number) => void;
  children: ReactElement | ReactElement[];
}

export const ActionMenu = forwardRef<HTMLUListElement, ActionMenuProps>(function ActionMenu(
  { attributes, children, selected, setSelected },
  ref,
) {
  return (
    <Container
      style={{
        position: attributes.strategy,
        top: attributes.y ? attributes.y + 5 : 0,
        left: attributes.x ?? 0,
      }}
      ref={ref}
    >
      {Children.map(children, (child: ReactElement<ActionProps>, idx) => (
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

interface ActionProps {
  onClick: () => unknown;
  text: string;
  disabled?: boolean;
}

export const Action: FC<PropsWithChildren<ActionProps>> = ({ children, disabled = false }) => {
  const _ = disabled;
  return children;
};
