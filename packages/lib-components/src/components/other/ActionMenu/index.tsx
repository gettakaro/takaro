import { Children, forwardRef, Dispatch, FC, ReactElement, SetStateAction, PropsWithChildren } from 'react';
import { Container, Item } from './style';
import { AiOutlineCheck as CheckMarkIcon } from 'react-icons/ai';
import { Elevation } from '../../../styled/';

export interface ActionMenuProps {
  attributes: {
    x: number | null;
    y: number | null;
    strategy: 'absolute' | 'fixed';
  };
  selectedState: [number, Dispatch<SetStateAction<number>>];
  children: ReactElement | ReactElement[];
  elevation?: Elevation;
}

export const ActionMenu = forwardRef<HTMLUListElement, ActionMenuProps>(function ActionMenu(
  { attributes, children, selectedState, elevation = 4 },
  ref,
) {
  const [selected, setSelected] = selectedState;

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
      {Children.map(children, (child: ReactElement<ActionProps>, idx) => (
        <Item onClick={() => setSelected(idx)}>
          {child}
          {selected === idx ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CheckMarkIcon size={15} />
            </div>
          ) : (
            <div className="checkmark-placeholder"></div>
          )}
        </Item>
      ))}
    </Container>
  );
});

interface ActionProps {
  onClick: () => unknown;
  text: string;
  // TODO: implement disabled when needed
}
export const Action: FC<PropsWithChildren<ActionProps>> = ({ children }) => {
  return <div>{children}</div>;
};
