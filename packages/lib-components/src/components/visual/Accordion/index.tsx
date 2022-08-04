import { AnimatePresence, motion } from 'framer-motion';
import { FC, useState } from 'react';
import { transparentize } from 'polished';
import { Color, styled } from '../../../styled';
import { AiOutlinePlus as Plus, AiOutlineMinus as Minus } from 'react-icons/ai';
import { getTransition } from '../../../..';

const Container = styled.div<{ color: Color; visible: boolean }>`
  margin: 0.5rem 0;
  border-radius: 0.5rem;
  height: 100%;
  background-color: ${({ visible, theme, color }) =>
    visible ? transparentize(0.7, theme.colors[color]) : 'transparent'};
  will-change: height;
  transition: 0.2s height ease-in-out;
`;

const TitleWrapper = styled.div<{ visible: boolean }>`
  display: flex;
  align-items: center;
  padding: 1rem 1rem 0 1rem;
  min-height: 40px;
  cursor: pointer;

  h3 {
    color: ${({ theme }): string => theme.colors.secondary};
    font-weight: 700;
    font-size: 1rem;
  }
`;

const IconWrapper = styled.div<{ color: Color }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: white;
  margin-right: 1rem;

  svg {
    fill: ${({ theme, color }) => theme.colors[color]};
  }
`;

const ContentContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  padding: 1.5rem 3.5rem 3rem 3.5rem;
  overflow-y: hidden;
`;

export interface AccordionProps {
  title: string;
  defaultVisible?: boolean;
  color?: Color;
}
export const Accordion: FC<AccordionProps> = ({
  color = 'primary',
  title,
  children,
  defaultVisible = false
}) => {
  const [visible, setVisible] = useState(defaultVisible);

  return (
    <Container color={color} visible={visible}>
      <TitleWrapper onClick={() => setVisible(!visible)} visible={visible}>
        {visible ? (
          <IconWrapper color={color}>
            <Minus size={15} />
          </IconWrapper>
        ) : (
          <IconWrapper color={color}>
            <Plus size={15} />
          </IconWrapper>
        )}
        <h3>{title}</h3>
      </TitleWrapper>
      <AnimatePresence>
        {visible && (
          <ContentContainer
            animate={{ height: 'auto' }}
            initial={{ height: 0 }}
            transition={getTransition()}
          >
            {children}
          </ContentContainer>
        )}
      </AnimatePresence>
    </Container>
  );
};
