import { styled } from '../../../styled';
import { motion } from 'framer-motion';

export const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  text-align: left;
`;

export const ContentContainer = styled.button<{ isChecked: boolean; hasError: boolean; readOnly: boolean }>`
  position: relative;
  width: 4.2rem;
  height: 2.5rem;
  display: block;
  cursor: ${({ readOnly }) => (readOnly ? 'default' : 'pointer')};
  border-radius: 9999px;
  border: 0.1rem solid ${({ theme, hasError }) => (hasError ? theme.colors.error : theme.colors.backgroundAccent)};
  margin: ${({ theme }) => theme.spacing[0]};
  background-color: ${({ theme, isChecked, hasError }) => {
    if (isChecked && hasError) {
      return theme.colors.error;
    }
    return isChecked ? theme.colors.primary : theme.colors.background;
  }};

  &:focus {
    border: 0.1rem solid ${({ theme, hasError }) => (hasError ? theme.colors.error : theme.colors.primary)};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

export const Dot = styled(motion.span)<{
  $isChecked: boolean;
  $readOnly: boolean;
}>`
  will-change: right;
  position: absolute;
  margin-top: -0.45rem;
  top: calc(50% - 0.62rem);
  border-radius: 50%;
  width: 2.1rem;
  height: 2.1rem;
  background-color: ${({ theme, $readOnly, $isChecked }) => {
    let color = $isChecked ? theme.colors.white : theme.colors.white;
    if ($readOnly) {
      color = theme.colors.backgroundAccent;
    }
    return color;
  }};
`;
