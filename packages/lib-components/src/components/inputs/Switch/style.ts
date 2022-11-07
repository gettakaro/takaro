import { styled } from '../../../styled';
import { lighten, darken } from 'polished';
import { motion } from 'framer-motion';

export const Container = styled.div`
  position: relative;
  display: inline-block;
  vertical-align: middle;
  text-align: left;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
`;

export const Label = styled.label`
  display: block;
  overflow: hidden;
  cursor: pointer;
  margin: 0 0 1rem 0;
`;

export const ContentContainer = styled.div`
  position: relative;
  width: 3rem;
  display: block;
  cursor: pointer;
  border: 0 solid #cccccc;
  margin: 0;
`;

export const Line = styled.span<{ isChecked: boolean; readOnly: boolean }>`
  display: block;
  width: 100%;
  border-radius: 2rem;
  height: 0.9rem;
  transition: background 0.2s ease-in-out;
  background: ${({ theme, readOnly, isChecked }): string => {
    let color = isChecked
      ? lighten(0.2, theme.colors.primary)
      : theme.colors.gray;
    if (readOnly) {
      color = darken(0.2, theme.colors.gray);
    }
    return color;
  }};
`;

export const Dot = styled(motion.span)<{
  isChecked: boolean;
  readOnly: boolean;
}>`
  display: block;
  width: 1.8rem;
  height: 1.8rem;
  border: 0.1rem solid
    ${({ theme, isChecked }) =>
      isChecked ? theme.colors.primary : theme.colors.gray};
  background-color: ${({ theme, readOnly, isChecked }) => {
    let color = isChecked ? theme.colors.primary : theme.colors.white;
    if (readOnly) {
      color = theme.colors.white;
    }
    return color;
  }};
  box-shadow: ${({ theme }) => theme.shadows.default};
  position: absolute;
  margin-top: -0.45rem;
  top: 0;
  bottom: 0;
  border-radius: 50%;
`;
