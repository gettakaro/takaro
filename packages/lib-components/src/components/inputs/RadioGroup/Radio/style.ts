import { styled } from '../../../../styled';
import { motion } from 'framer-motion';

export const RadioContainer = styled.div<{
  readOnly: boolean;
  isSelected: boolean;
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
    ${({ theme, readOnly, isSelected }): string => {
      if (readOnly) return theme.colors.gray;
      if (isSelected) return theme.colors.primary;
      return theme.colors.gray;
    }};

  background-color: ${({ theme, readOnly }) =>
    readOnly ? theme.colors.gray : theme.colors.backgroundAlt};
  border-radius: 100%;
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
  border-radius: 100%;
  background-color: ${({ theme, readOnly }) =>
    readOnly ? theme.colors.gray : theme.colors.primary};
  opacity: ${({ isSelected }): number => (isSelected ? 1 : 0)};
  transition: 0.1s opacity linear cubic-bezier(0.215, 0.61, 0.355, 1);
`;

export const Input = styled.input`
  position: absolute;
  visibility: hidden;
`;
