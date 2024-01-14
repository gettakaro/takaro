import { styled } from '../../../../styled';
import { motion } from 'framer-motion';

export const RadioContainer = styled.div<{
  readOnly: boolean;
  isSelected: boolean;
  isError: boolean;
}>`
  display: grid;
  place-items: center;
  min-width: ${({ theme }) => theme.spacing['2_5']};
  min-height: ${({ theme }) => theme.spacing['2_5']};
  width: ${({ theme }) => theme.spacing['2_5']};
  height: ${({ theme }) => theme.spacing['2_5']};
  max-width: ${({ theme }) => theme.spacing['2_5']};
  max-height: ${({ theme }) => theme.spacing['2_5']};
  align-items: center;
  justify-content: center;
  border: 0.1rem solid
    ${({ theme, readOnly, isSelected, isError }): string => {
      if (readOnly) return theme.colors.backgroundAccent;
      if (isError) return theme.colors.error;
      if (isSelected) return theme.colors.primary;
      return theme.colors.backgroundAccent;
    }};

  background-color: ${({ theme, readOnly }) => (readOnly ? theme.colors.backgroundAccent : theme.colors.background)};
  border-radius: 100%;
  cursor: ${({ readOnly }) => (readOnly ? 'normal' : 'pointer')};
  overflow: visible;

  &.placeholder {
    border: none;
    border-radius: 50%;
    width: 2.2rem; /* 2.1rem + 1px shadow */
    height: 2.2rem;
    cursor: default;
  }
`;

export const Inner = styled(motion.div)<{
  isSelected: boolean;
  readOnly: boolean;
  isError: boolean;
}>`
  width: ${({ theme }) => theme.spacing['1_5']};
  height: ${({ theme }) => theme.spacing['1_5']};
  border-radius: 100%;
  background-color: ${({ theme, readOnly, isError }) => {
    if (readOnly) return theme.colors.backgroundAlt;
    if (isError) return theme.colors.error;
    /* No need to check if selected here since opacity is only 1 if isSelected*/
    return theme.colors.primary;
  }};
  opacity: ${({ isSelected }): number => (isSelected ? 1 : 0)};
  transition: 0.1s opacity linear cubic-bezier(0.215, 0.61, 0.355, 1);
`;

export const Input = styled.input`
  position: absolute;
  visibility: hidden;
`;
