import { styled } from '../../../../styled';
import { motion } from 'framer-motion';

export const Container = styled.div`
  margin: 1rem 0;
  display: flex;
  align-items: center;
`;

export const RadioContainer = styled.div<{ readOnly: boolean }>`
  display: flex;
  position: relative;
  width: 2.1rem;
  height: 2.1rem;
  align-items: center;
  justify-content: center;
  border: 0.3rem solid
    ${({ theme, readOnly }): string =>
      readOnly ? theme.colors.gray : theme.colors.primary};

  background-color: ${({ theme, readOnly }) =>
    readOnly ? theme.colors.gray : theme.colors.primary};
  border-radius: 50%;
  cursor: ${({ readOnly }) => (readOnly ? 'normal' : 'pointer')};
  z-index: 1;
  overflow: visible;

  &.placeholder {
    border: none;
    border-radius: 50%;
    width: 2.4rem; /* 2.1rem + 3px shadow */
    height: 2.4rem;
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
    readOnly ? theme.colors.gray : theme.colors.white};
  opacity: ${({ isSelected }): number => (isSelected ? 1 : 0)};
  transition: 0.2s opacity ease-in-out cubic-bezier(0.215, 0.61, 0.355, 1);
`;

export const Label = styled.label<{ isLeft: boolean; readOnly: boolean }>`
  margin: ${({ isLeft }) => (isLeft ? '0 1rem 0 0' : '0 0 0 1rem')};
  cursor: ${({ readOnly }) => (readOnly ? 'normal' : 'pointer')};
`;

export const Input = styled.input`
  position: absolute;
  visibility: hidden;
`;
