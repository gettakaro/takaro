import { Size, styled } from '../../../styled';
import { motion } from 'framer-motion';
import { shade } from 'polished';

export const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing['0_5']};
`;

export const Input = styled.input`
  position: absolute;
  visibility: hidden;
`;

export const BackgroundContainer = styled(motion.div)<{ $size: Size }>`
  background-color: ${({ theme }) => shade(0.5, theme.colors.primary)};

  ${({ $size }): string => {
    switch ($size) {
      case 'tiny':
        return `
          width: 1.2rem;
          height: 1.2rem;
        `;
      case 'small':
        return `
          width: 1.6rem;
          height: 1.6rem;
        `;
      case 'medium':
        return `
          width: 2rem;
          height: 2rem;
        `;
      case 'large':
        return `
          width: 2.4rem;
          height: 2.4rem;
        `;
      case 'huge':
        return `
          width: 2.8rem;
          height: 2.8rem;
        `;
    }
  }}
`;

export const CheckboxContainer = styled.button<{
  isChecked?: boolean;
  readOnly: boolean;
  hasError: boolean;
  disabled: boolean;
}>`
  display: flex;
  padding: 0;
  background-color: transparent;
  position: relative;
  align-items: center;
  justify-content: center;
  border: 0.1rem solid
    ${({ theme, isChecked, hasError, disabled }): string => {
      if (disabled) {
        return theme.colors.disabled;
      }
      if (isChecked) {
        return theme.colors.primary;
      }
      if (hasError) {
        return theme.colors.error;
      }
      return theme.colors.backgroundAccent;
    }};

  border-radius: ${({ theme }) => theme.borderRadius.small};
  transition:
    box-shadow 100ms linear,
    border-color 100ms linear;
  cursor: ${({ readOnly, disabled }) => {
    if (disabled) {
      return 'not-allowed';
    }
    if (readOnly) {
      return 'inherit';
    }
    return 'pointer';
  }};
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
  display: flex;
  visibility: ${({ isChecked }): string => (isChecked ? 'visible' : 'hidden')};
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  opacity: ${({ isChecked }): number => (isChecked ? 1 : 0)};
  transition: 0.2s opacity ease-in-out cubic-bezier(0.215, 0.61, 0.355, 1);

  svg {
    fill: white;
    stroke: white;
  }
`;
