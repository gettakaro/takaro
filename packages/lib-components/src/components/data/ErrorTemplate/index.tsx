import { FC } from 'react';
import { motion } from 'framer-motion';
import { styled } from '../../../styled';
import { Button } from '../..';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  position: relative;
  height: 100vh;
  overflow: hidden;
  background-color: white;

  h1 {
    font-size: 5rem;
    color: ${({ theme }) => theme.colors.secondary};
    font-weight: 800;
    z-index: 2;
  }

  h2 {
    position: absolute;
    font-size: 20rem;
    font-weight: 800;
    opacity: 0.3;
    color: ${({ theme }) => theme.colors.primary};
  }

  button {
    position: absolute;
    top: 65%;
    width: 50%;
  }
`;

export interface ErrorTemplateProps {
  title: string;
  description: string;
}

export const ErrorTemplate: FC<ErrorTemplateProps> = ({ title, description }) => {
  const navigate = useNavigate();
  return (
    <Container>
      <motion.h1 animate={{ opacity: 1 }} initial={{ opacity: 0 }} transition={{ delay: 0.5 }}>
        {description}
      </motion.h1>
      <motion.h2
        animate={{ scale: 1 }}
        initial={{ scale: 0 }}
        transition={{ type: 'spring', bounce: 0.6, duration: 1 }}
      >
        {title}
      </motion.h2>
      <Button onClick={() => navigate('/')} text="Go back to safety!" />
    </Container>
  );
};
