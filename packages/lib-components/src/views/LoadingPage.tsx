import { FC } from 'react';
import { styled } from '../styled';
import { Loading } from '../components';
import { motion } from 'framer-motion';
import { getTransition } from '../helpers';

const Container = styled(motion.div)`
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const animations = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const LoadingPage: FC = () => {
  return (
    <Container
      animate="animate"
      initial="initial"
      key="loading-page"
      transition={{
        ...getTransition(),
      }}
      variants={animations}
    >
      <Loading fill="white" />
    </Container>
  );
};
