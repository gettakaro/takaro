import { styled } from '../../../../styled';
import { motion } from 'framer-motion';

export const Container = styled.div`
  margin: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[0]}`};
  display: flex;
  align-items: center;
`;

export const RadioContainer = styled.div<{
  readOnly: boolean;
  isSelected: boolean;
}>`
  display: grid;
  place-items: center;
  min-width: 2.1rem;
  min-height: 2.1rem;
  width: 2.1rem;
  height: 2.1rem;
  max-width: 2.1rem;
  max-height: 2.1rem;
  align-items: center;
  justify-content: center;
  border: 0.1rem solid
    ${({ theme, readOnly, isSelected }): string => {
      if (readOnly) return theme.colors.gray;
      if (isSelected) return theme.colors.primary;
      return theme.colors.gray;
    }};

  background-color: ${({ theme, readOnly }) =>
    readOnly ? theme.colors.gray : theme.colors.backgroundAlt};
  border-radius: 50%;
  cursor: ${({ readOnly }) => (readOnly ? 'normal' : 'pointer')};
  z-index: 1;
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
}>`
  width: ${({ theme }) => theme.spacing['1_5']};
  height: ${({ theme }) => theme.spacing['1_5']};
  z-index: 2;
  border-radius: 50%;
  background-color: ${({ theme, readOnly }) =>
    readOnly ? theme.colors.gray : theme.colors.primary};
  opacity: ${({ isSelected }): number => (isSelected ? 1 : 0)};
  transition: 0.1s opacity linear cubic-bezier(0.215, 0.61, 0.355, 1);
`;

export const Input = styled.input`
  position: absolute;
  visibility: hidden;
`;
