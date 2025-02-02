import { styled } from '../../../styled';
import { HorizontalNavVariant } from '.';
import { shade } from 'polished';

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
      case 'clear':
        return '';
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
        case 'clear':
          return `
          border-radius: ${theme.borderRadius.small};
          padding: ${theme.spacing['0_5']} ${theme.spacing['0_75']};
          font-weight: 500;
          color: ${theme.colors.text};
          border: 1px solid ${theme.colors.background};
        `;
      }
    }}
    border-radius: ${({ theme }) => theme.borderRadius.small};
    color: ${({ theme }) => theme.colors.textAlt};
    font-size: ${({ theme }) => theme.fontSize.medium};

    &.active {
      color: ${({ theme }) => theme.colors.text};

      ${({ variant, theme }) => {
        switch (variant) {
          case 'underline':
            return `
                  &:after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 0;
        right: 0;
        height: 1px;
        width: 100%;
        background-color: ${theme.colors.primary};
      }
      `;
          case 'clear':
            return `
          background-color: ${shade('0.5', theme.colors.primary)};
          color: white;
          border-color: ${theme.colors.primary};
        `;
          case 'block':
            return '';
        }
      }}
  }
`;
