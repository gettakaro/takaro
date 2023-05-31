import { styled } from '../../../styled';
import { motion } from 'framer-motion';

export const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: ${({ theme }) => theme.spacing['1_5']};
`;

export const Input = styled.input`
  position: absolute;
  visibility: hidden;
`;

export const BackgroundContainer = styled(motion.div)`
  position: absolute;
  width: 2.3rem;
  height: 2.3rem;
  background-color: ${({ theme }) => theme.colors.primary};
  z-index: 0;
  border-radius: ${({ theme }) => theme.borderRadius.small};
`;

export const CheckboxContainer = styled.div<{
  isChecked?: boolean;
  readOnly: boolean;
  error: boolean;
  disabled: boolean;
}>`
  display: flex;
  position: relative;
  min-width: 2.3rem;
  min-height: 2.3rem;
  align-items: center;
  justify-content: center;
  border: 0.1rem solid
    ${({ theme, isChecked, error, disabled }): string => {
      if (disabled) {
        return theme.colors.disabled;
      }
      if (isChecked) {
        return theme.colors.primary;
      }
      if (error) {
        return theme.colors.error;
      }
      return theme.colors.primary;
    }};

  border-radius: ${({ theme }) => theme.borderRadius.small};
  transition: box-shadow 100ms linear, border-color 100ms linear;
  cursor: ${({ readOnly, disabled }) =>
    readOnly || disabled ? 'not-allowed' : 'pointer'};
  z-index: 1;
  overflow: visible;
  &.placeholder {
    border: none; /* Otherwise the border does not have the animation */
    border-radius: ${({ theme }) => theme.borderRadius.small};
    width: 2.4rem;
    height: 2.4rem;
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
