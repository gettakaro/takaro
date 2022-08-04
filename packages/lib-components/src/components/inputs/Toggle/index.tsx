import { FC, useState } from 'react';
import { AnimateSharedLayout, motion } from 'framer-motion';
import { styled } from '../../../styled';

const Container = styled.div`
  border: 1px solid ${({ theme }): string => theme.colors.primary};
`;

export interface ToggleProps {
  size?: 'small' | 'medium' | 'large';
  items: string[];
  onClick: (index: number) => void;
}
export const Toggle: FC<ToggleProps> = ({ items, onClick }) => {
  const [selected, setSelected] = useState<number>(0);

  return (
    <Container>
      <AnimateSharedLayout>
        {items.map((item, index) => (
          <ToggleItem
            onClick={() => {
              onClick(index);
              setSelected(index);
            }}
            selected={index === selected}
            text={item}
          />
        ))}
      </AnimateSharedLayout>
    </Container>
  );
};

const Item = styled.div``;
const Background = styled(motion.div)`
  position: absolute;
  border-radius: 1.5rem;
  width: 101%;
  top: 0;
  left: 0;
  height: calc(100% + 2px);
  background-color: transparent;
`;

interface ToggleItemProps {
  selected: boolean;
  text: string;
  onClick: () => void;
}
const ToggleItem: FC<ToggleItemProps> = ({ text, selected, onClick }) => {
  return (
    <Item onClick={onClick}>
      {selected && <Background />}
      {text}
    </Item>
  );
};
