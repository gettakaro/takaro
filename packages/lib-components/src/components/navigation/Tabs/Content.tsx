import { forwardRef, PropsWithChildren } from 'react';
import { styled } from '../../../styled';
import { useTabsContext } from './Context';
import { motion } from 'framer-motion';

const Container = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing['2']};
`;

interface ContentProps {
  value: string;
}

const variants = {
  visible: { opacity: 1, x: 0 },
  hidden: { opacity: 0, x: '20px' },
};

export const Content = forwardRef<HTMLDivElement, PropsWithChildren<ContentProps>>(function TabsContent(
  { children, value },
  ref,
) {
  const { value: selectedValue } = useTabsContext();

  const isHidden = value !== selectedValue;

  return (
    <Container
      ref={ref}
      role="tabpanel"
      aria-labelledby={`tab-content-${value}`}
      hidden={isHidden}
      animate={isHidden ? 'hidden' : 'visible'}
      variants={variants}
    >
      {children}
    </Container>
  );
});
