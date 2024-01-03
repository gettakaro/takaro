import { styled } from '../../../../styled';
import { motion } from 'framer-motion';

export const Input = styled.input<{ hasError: boolean; isLoading: boolean }>`
  border: 1px solid ${({ theme, hasError }) => (hasError ? theme.colors.error : theme.colors.backgroundAccent)};
  padding-right: ${({ theme }) => theme.spacing['2']};
  width: 100%;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const LoadingIcon = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: ${({ theme }) => theme.spacing['1']};
`;

export const LoadingContainer = styled(motion.div)`
  display: flex;
  flex-direciton: row;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing['0_5']} 0;

  span {
    margin-left: ${({ theme }) => theme.spacing['1']};
  }
`;
