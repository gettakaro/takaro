import { styled } from '../../../styled';
import { motion } from 'framer-motion';

export const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 2.5rem;
`;

export const Label = styled.label<{ position: 'left' | 'right' }>`
  margin: ${({ position }) =>
    position === 'left' ? '0 2.5rem 0 0' : '0 0 0 2.5rem'};
  cursor: pointer;
  font-size: 1.5rem;
  user-select: none;
`;

export const Input = styled.input`
  position: absolute;
  visibility: hidden;
`;

export const BackgroundContainer = styled(motion.div)`
  position: absolute;
  width: 21px;
  height: 21px;
  background-color: ${({ theme }) => theme.colors.primary};
  z-index: 0;
`;

export const CheckboxContainer = styled.div<{
  isChecked?: boolean;
  readOnly: boolean;
}>`
  display: flex;
  position: relative;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border: 3px solid
    ${({ theme, readOnly }): string =>
      readOnly ? theme.colors.gray : theme.colors.primary};
  border-radius: 4px;
  transition: box-shadow 0.125s linear, border-color 0.15s linear;
  cursor: ${({ readOnly }) => (readOnly ? 'not-allowed' : 'pointer')};
  z-index: 1;
  overflow: visible;
  &.placeholder {
    border: none; /* Otherwise the border does not have the animation */
    border-radius: 4px;
    width: 24px;
    height: 24px;
    cursor: default;
  }
`;

export const CheckMarkContainer = styled.div<{ isChecked: boolean }>`
  display: ${({ isChecked }): string => (isChecked ? 'flex' : 'none')};
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  z-index: 2;
  opacity: ${({ isChecked }): number => (isChecked ? 1 : 0)};
  transition: 0.2s opacity ease-in-out cubic-bezier(0.215, 0.61, 0.355, 1);

  svg {
    fill: white;
    stroke: white;
  }
`;
