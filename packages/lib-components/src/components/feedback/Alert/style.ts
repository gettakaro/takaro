import { Elevation, styled } from '../../../styled';
import { AlertVariants } from '.';
import { motion } from 'framer-motion';
import { lighten, darken } from 'polished';

export const Container = styled(motion.div)<{
  variant: AlertVariants;
  hasTitle: boolean;
  elevation: Elevation;
}>`
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing[1]}`};
  border-radius: 1rem;
  box-shadow: ${({ theme, elevation }) => theme.elevation[elevation]};
  margin: ${({ theme }) => `${theme.spacing['1_5']} auto`};
  h2 {
    font-size: 1.825rem;
    display: flex;
    align-items: center;
    font-weight: 700;
    justify-content: flex-start;
  }
  p {
    margin-top: ${({ theme, hasTitle }) =>
      hasTitle ? theme.spacing['1_5'] : theme.spacing[0]};
  }
  p,
  li {
    font-size: 1.325rem;
  }
  ul {
    margin-left: ${({ theme }) => theme.spacing['1_5']};
    li {
      list-style-type: disc;
      margin-top: ${({ theme }) => theme.spacing['0_5']};
      margin-bottom: ${({ theme }) => theme.spacing['0_5']};
    }
  }
  /* set background color equal to provided type */
  ${({ variant, theme }): string => {
    return `
        background-color: ${lighten('0.3', theme.colors[variant])};
        h2 {
          color: ${darken('0.2', theme.colors[variant])};
        }
        p, li {
          color: ${darken('0.2', theme.colors[variant])};
        }
        ::marker {
          color: ${darken('0.2', theme.colors[variant])};
        }
        `;
  }}
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: ${({ theme }) => theme.spacing[5]} 1fr;
  align-items: center;
`;

export const IconContainer = styled.div<{ variant: AlertVariants }>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing['1_5']};
  svg {
    fill: ${({ variant, theme }): string => theme.colors[variant]};
  }
`;

export const ButtonContainer = styled.div<{
  show: boolean;
  variant: AlertVariants;
}>`
  display: ${({ show }): string => (show ? 'flex' : 'none')};
  button {
    margin-top: ${({ theme }) => theme.spacing[2]};
    margin-right: ${({ theme }) => theme.spacing[2]};
    padding: ${({ theme }) =>
      `${theme.spacing['0_75']} ${theme.spacing['0_5']}`};
    border-radius: 0.5rem;
    background-color: ${({ theme, variant }): string =>
      lighten('0.2', theme.colors[variant])};
    font-size: 1.3rem;
    border: none;
    cursor: pointer;
    font-weight: 700;
    color: ${({ theme, variant }): string =>
      darken('0.2', theme.colors[variant])};
  }
`;
