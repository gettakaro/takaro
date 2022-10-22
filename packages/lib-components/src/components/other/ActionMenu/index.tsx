import { Children, forwardRef, Dispatch, FC, ReactElement, SetStateAction } from 'react';
import { Container, Item } from './style';
import { AiOutlineCheck as CheckMarkIcon } from 'react-icons/ai';

export interface ActionMenuProps {
  attributes: {
    x: number | null,
    y: number | null,
    strategy: 'absolute' | 'fixed'
  };
  selectedState: [number, Dispatch<SetStateAction<number>>];
  children: ReactElement | ReactElement[];
}

export const ActionMenu = forwardRef<HTMLUListElement, ActionMenuProps>(
  ({ attributes, children, selectedState }, ref) => {
    const [selected, setSelected] = selectedState;

    return (
      <Container
        style={{
          position: attributes.strategy,
          top: attributes.y ? attributes.y + 5 : 0,
          left: attributes.x ?? 0
        }}
        ref={ref}
      >
        {Children.map(children, (child: ReactElement<ActionProps>, idx) => (
          <Item onClick={() => setSelected(idx)}>
            {selected === idx ? <div><CheckMarkIcon size={20} /></div> : <div className='checkmark-placeholder'></div>}
            {child}
          </Item>
        ))}
      </Container>
    );
  }
);

interface ActionProps {
  onClick: () => unknown;
  text: string;
  // TODO: implement disabled when needed
}
export const Action: FC<ActionProps> = ({ children }) => {
  return (<div>{children}</div>);
};

