// TODO: Create stripe-like-headernav.
import { FC, useState } from 'react';
import { AnimateSharedLayout, motion } from 'framer-motion';
import { styled } from '../../styled';

const Container = styled.div``;
const Nav = styled.nav`
  display: flex;
  flex-direction: row;
  align-items: center;

  li {
    margin: 20px 50px;
    font-size: 1.2rem;
  }
`;

export const HeaderNav: FC = () => {
  const [hovered, setHovered] = useState(0);
  const items = ['red', 'green', 'orange'];

  return (
    <Container>
      <AnimateSharedLayout>
        <Nav>
          <li onMouseEnter={() => setHovered(0)}>element 1</li>
          <li onMouseEnter={() => setHovered(1)}>element 2</li>
          <li onMouseEnter={() => setHovered(2)}>element 3</li>
        </Nav>
        <AnimateSharedLayout>
          <motion.div>
            {items.map((item, index) => (
              <ContentContainer color={item} index={index} isHovered={hovered === index} />
            ))}
          </motion.div>
        </AnimateSharedLayout>
      </AnimateSharedLayout>
    </Container>
  );
};

const CustomContent = styled(motion.div)`
  width: 300px;
  border: 2px solid black;
`;

interface ContentProps {
  isHovered: boolean;
  index: number;
  color: string;
}

const spring = {
  type: 'spring',
  stiffness: 500,
  damping: 30
};

const ContentContainer: FC<ContentProps> = ({ color, isHovered, index }) => {
  return (
    <div>
      {isHovered && (
        <CustomContent
          animate={{ borderColor: color }}
          initial={false}
          layoutId="custom-nav"
          transition={spring}
        >
          <h1>this is the content {index}</h1>
        </CustomContent>
      )}
    </div>
  );
};
