import { FC, PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import { getTransition, styled } from '@takaro/lib-components';

const Container = styled(motion.div)`
  height: 100%;
  padding: 5rem;
`;

const animations = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};

export const Page: FC<PropsWithChildren<unknown>> = ({ children }) => {
  return (
    <Container
      animate="animate"
      initial="initial"
      transition={{
        ...getTransition(),
      }}
      variants={animations}
    >
      {children}
    </Container>
  );
};
