import { Elevation, styled } from '../../../styled';
import { AlertVariants } from '.';
import { motion } from 'framer-motion';
import { shade } from 'polished';

// Since this actually a motion.div we are passing props to that only should be consumed by styled compmonents
// and not being passed the the underlying react node, we can prefix the prop names with `$`to turn it into
// a transient prop.
export const Container = styled(motion.div)<{
  $variant: AlertVariants;
  $hasTitle: boolean;
  $elevation: Elevation;
}>`
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing[1]}`};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: ${({ theme, $elevation }) => theme.elevation[$elevation]};
  margin: ${({ theme }) => `${theme.spacing['1_5']} auto`};
  h2 {
    font-size: 1.825rem;
    display: flex;
    align-items: center;
    font-weight: 700;
    justify-content: flex-start;
  }
  p {
    margin-top: ${({ theme, $hasTitle }) => ($hasTitle ? theme.spacing['0_5'] : theme.spacing[0])};
    margin-bottom: 0;
    hyphens: auto;
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
  ${({ $variant, theme }): string => {
    return `
        background-color: ${shade('0.5', theme.colors[$variant])};
        border: 1px solid ${theme.colors[$variant]};
        h2 {
          color: white;
        }
        p, li {
          color: white;
        }
        ::marker {
          color: white;
        }
        `;
  }}
`;

export const Grid = styled.div<{ hasTitle: boolean; showIcon: boolean }>`
  display: grid;
  grid-template-columns: ${({ theme, hasTitle, showIcon }) => {
    const result = '';
    if (showIcon) result.concat(`${theme.spacing[5]}`);
    result.concat(' 1fr');
    if (hasTitle) result.concat(' fit-content(100px)');
    return result;
  }}
  align-items: center;
  gap: ${({ theme, hasTitle }) => (hasTitle ? 0 : theme.spacing['0_5'])};
`;

export const IconContainer = styled.div<{ variant: AlertVariants }>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing['1']};
  svg {
    fill: ${({ variant, theme }): string => theme.colors[variant]};
  }
`;

export const ButtonContainer = styled.div<{
  show: boolean;
  variant: AlertVariants;
  hasTitle: boolean;
}>`
  display: ${({ show }): string => (show ? 'flex' : 'none')};
  align-items: center;
  white-space: nowrap;
  margin-top: ${({ theme, hasTitle }): string => (hasTitle ? theme.spacing['1'] : theme.spacing[0])};
`;
