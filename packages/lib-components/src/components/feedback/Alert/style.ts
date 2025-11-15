import { styled } from '../../../styled';
import { AlertVariants } from '.';
import { motion } from 'framer-motion';
import { shade } from 'polished';

// Since this actually a motion.div we are passing props to that only should be consumed by styled compmonents
// and not being passed the the underlying react node, we can prefix the prop names with `$`to turn it into
// a transient prop.
export const Container = styled(motion.div)<{
  $variant: AlertVariants;
  $hasTitle: boolean;
}>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing['0_75']};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  margin: ${({ theme }) => `${theme.spacing['1_5']} auto`};
  h2 {
    font-size: ${({ theme }) => theme.fontSize.mediumLarge};
    font-weight: 700;
    margin: 0;
    text-align: left;
  }
  p {
    margin-top: ${({ theme, $hasTitle }) => ($hasTitle ? theme.spacing['0_25'] : theme.spacing[0])};
    margin-bottom: 0;
    hyphens: auto;
    text-align: left;
    font-size: ${({ theme }) => theme.fontSize.medium};
  }
  li {
    font-size: ${({ theme }) => theme.fontSize.medium};
    text-align: left;
  }
  ul {
    margin-left: ${({ theme }) => theme.spacing['1_5']};
    margin-top: ${({ theme, $hasTitle }) => ($hasTitle ? theme.spacing['0_25'] : theme.spacing[0])};
    margin-bottom: 0;
    li {
      list-style-type: disc;
      margin-top: ${({ theme }) => theme.spacing['0_5']};
      margin-bottom: ${({ theme }) => theme.spacing['0_5']};
      &::marker {
        font-size: ${({ theme }) => theme.fontSize.medium};
      }
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

export const Grid = styled.div<{ $useStartAlignment: boolean }>`
  display: grid;
  grid-template-columns: 40px 1fr;
  align-items: ${({ $useStartAlignment }) => ($useStartAlignment ? 'start' : 'center')};
  gap: ${({ theme }) => theme.spacing['0_5']};

  p,
  ul,
  .action {
    grid-column: 2;
  }
`;

export const IconContainer = styled.div<{ variant: AlertVariants }>`
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    fill: white;
  }
`;

export const ButtonContainer = styled.div<{
  show: boolean;
  variant: AlertVariants;
  hasContent: boolean;
}>`
  display: ${({ show }): string => (show ? 'flex' : 'none')};
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing['0_5']};
  margin-top: ${({ theme, hasContent }): string => (hasContent ? theme.spacing['1'] : theme.spacing[0])};
`;
