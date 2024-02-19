import { styled } from '../../../styled';
import { motion } from 'framer-motion';
import { HorizontalNavVariant } from '.';

export const NavBar = styled.nav<{ variant: HorizontalNavVariant }>`
  display: flex;
  position: relative;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing[1]};

  ${({ variant, theme }) => {
    switch (variant) {
      case 'block':
        return `
          background-color: ${theme.colors.backgroundAlt}; 
          width: fit-content;
          padding: ${theme.spacing['0_75']} ${theme.spacing['0_75']};
          border-radius: ${theme.borderRadius.medium};
          border: 1px solid ${theme.colors.backgroundAccent};
        `;
      case 'underline':
        return `
          border-bottom: 1px solid ${theme.colors.backgroundAccent};
          width: 100%;
          padding-bottom: ${theme.spacing['0_75']};
        `;
    }
  }}

  a {
    position: relative;
    ${({ variant, theme }) => {
      switch (variant) {
        case 'block':
          return `
            font-weight: bold;
            padding: ${theme.spacing['0_75']};
            span {
              position: relative;
              z-index: 10;
            }
          `;
        case 'underline':
          return `
            font-weight: 500;
            padding: 0 ${theme.spacing['0_75']};
          `;
      }
    }}
    border-radius: ${({ theme }) => theme.borderRadius.small};
    color: ${({ theme }) => theme.colors.textAlt};
    font-size: ${({ theme }) => theme.fontSize.medium};

    &.active {
      color: ${({ theme }) => theme.colors.text};
    }
  }
`;

export const Underline = styled(motion.div)`
  position: absolute;
  bottom: -${({ theme }) => theme.spacing['0_75']};
  left: 0px;
  display: block;
  height: 2px;
  background-color: ${({ theme }) => theme.colors.primary};
  content: '';
  width: 100%;
`;

export const Block = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0px;
  z-index: 1;
  display: block;
  height: 100%;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.primaryShade};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  content: '';
  width: 100%;
`;
