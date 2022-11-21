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
  display: flex;
  position: relative;
  width: 2.1rem;
  height: 2.1rem;
  align-items: center;
  justify-content: center;
  border: 0.1rem solid
    ${({ theme, readOnly, isSelected }): string => {
      if (readOnly) return theme.colors.gray;
      if (isSelected) return theme.colors.primary;
      return theme.colors.gray;
    }};

  background-color: ${({ theme, readOnly }) =>
    readOnly ? theme.colors.gray : theme.colors.white};
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
  display: ${({ isSelected }): string => (isSelected ? 'flex' : 'none')};
  width: 50%;
  height: 50%;
  align-items: center;
  border-radius: 90%;
  justify-content: center;
  z-index: 2;
  background-color: ${({ theme, readOnly }) =>
    readOnly ? theme.colors.gray : theme.colors.primary};
  opacity: ${({ isSelected }): number => (isSelected ? 1 : 0)};
  transition: 0.2s opacity ease-in-out cubic-bezier(0.215, 0.61, 0.355, 1);
`;

export const Label = styled.label<{ isLeft: boolean; readOnly: boolean }>`
  margin: ${({ isLeft, theme }) =>
    isLeft ? `0 ${theme.spacing[1]} 0 0` : `0 0 0 ${theme.spacing[1]}`};
  cursor: ${({ readOnly }) => (readOnly ? 'normal' : 'pointer')};
`;

export const Input = styled.input`
  position: absolute;
  visibility: hidden;
`;
