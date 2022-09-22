import { FC } from 'react';
import { motion } from 'framer-motion';
import { getTransition } from '@takaro/lib-components';

const animations = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 }
};

export const Page: FC = ({ children }) => {
  return (
    <motion.div
      animate="animate"
      initial="initial"
      transition={{
        ...getTransition(),
        duration: 0.3
      }}
      variants={animations}
    >
      {children}
    </motion.div>
  );
};
