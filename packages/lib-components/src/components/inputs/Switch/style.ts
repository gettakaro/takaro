import { styled } from '../../../styled';
import { motion } from 'framer-motion';

export const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  text-align: left;
`;

export const ContentContainer = styled.button<{ isChecked: boolean; hasError: boolean }>`
  position: relative;
  width: 4.2rem;
  height: 2.5rem;
  display: block;
  cursor: pointer;
  border-radius: 9999px;
  border: 0.1rem solid ${({ theme, hasError }) => (hasError ? theme.colors.error : theme.colors.backgroundAlt)};
  margin: ${({ theme }) => theme.spacing[0]};
  background-color: ${({ theme, isChecked }) => (isChecked ? theme.colors.primary : theme.colors.background)};

  &:focus {
    border: 0.1rem solid ${({ theme, hasError }) => (hasError ? theme.colors.error : theme.colors.primary)};
  }
`;

export const Dot = styled(motion.span)<{
  isChecked: boolean;
  readOnly: boolean;
}>`
  position: absolute;
  margin-top: -${({ theme }) => theme.spacing['0_5']};
  top: 50%;
  border-radius: 50%;
  transform: translateY(-30%);
  width: 2.1rem;
  height: 2.1rem;
  background-color: ${({ theme, readOnly, isChecked }) => {
    let color = isChecked ? theme.colors.white : theme.colors.white;
    if (readOnly) {
      color = theme.colors.disabled;
    }
    return color;
  }};
`;
