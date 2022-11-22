import { FC } from 'react';
import { styled } from '../../styled';
import { motion } from 'framer-motion';

const Container = styled(motion.div)`
  position: absolute;
  min-height: ${({ theme }) => theme.spacing[5]};
  display: flex;
  align-items: center;
  bottom: ${({ theme }) => `-${theme.spacing[6]}`};
  height: auto;
  background-color: ${({ theme }): string => theme.colors.error};
  overflow: hidden;
  border-radius: 0.5rem;
  z-index: 5;
`;

const Content = styled.span`
  display: flex;
  align-items: center;
  min-width: 100%;
  width: 100%;
  padding: ${({ theme }) =>
    `${theme.spacing['0_5']} ${theme.spacing['0_5']} ${theme.spacing['0_5']} ${theme.spacing['1_5']}`};
  height: ${({ theme }) => theme.spacing[5]};
  color: white;
  font-weight: 500;
  white-space: nowrap;
`;

export interface ErrorProps {
  message: string;
}

export const ErrorMessage: FC<ErrorProps> = ({ message }) => {
  return (
    <Container initial={{ width: 0 }} animate={{ width: '100%' }}>
      <Content>{message}</Content>
    </Container>
  );
};
