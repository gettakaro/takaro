import { AvatarVariant } from '.';
import { styled, Size } from '../../../styled';

export const GroupContainer = styled.div<{ size: Size; unStackOnHover: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    div {
      ${({ unStackOnHover }) => (unStackOnHover ? 'margin-left: 0;' : '')}
    }
  }

  div {
    transition: margin-left 0.2s ease-in-out;
    /* mind the negative sign here */
    margin-left: -${({ theme }) => theme.spacing['5']};

    :first-child {
      margin-left: ${({ theme }) => theme.spacing[0]};
    }

    ${({ size, theme }) => {
      switch (size) {
        case 'tiny':
          return `margin-left: -${theme.spacing['0_25']};`;
        case 'small':
          return `margin-left: -${theme.spacing['1']};`;
        case 'medium':
          return `margin-left: -${theme.spacing['3']};`;
        case 'large':
          return `margin-left: -${theme.spacing['8']};`;
        case 'huge':
          return `margin-left: -${theme.spacing['10']};`;
      }
    }}
  }
`;

export const Container = styled.div<{ size: Size; variant?: AvatarVariant }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;

  img {
    width: 100%;
    height: 100%;
    ${({ theme, variant }) => {
      switch (variant) {
        case 'square':
          return 'border-radius: 0;';
        case 'rounded':
          return `border-radius: ${theme.borderRadius['small']};`;
        default:
          return 'border-radius: 50%;';
      }
    }}
  }

  span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    /* 2px is the size of the border */
    width: calc(100% - 2px);
    height: calc(100% - 2px);
    ${({ theme, variant }) => {
      switch (variant) {
        case 'square':
          return 'border-radius: 0;';
        case 'rounded':
          return `border-radius: ${theme.borderRadius['small']};`;
        default:
          return 'border-radius: 50%;';
      }
    }}
    background-color: ${({ theme }) => theme.colors.background};
    border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
    margin-left: 0;
  }

  ${({ size, theme }) => {
    switch (size) {
      case 'tiny':
        return `
          width: 1rem;
          height: 1rem;
          font-size: .8rem;
          line-height: .8rem;
        `;
      case 'small':
        return `
          width: 3.125rem;
          height: 3.125rem;
          font-size: ${theme.fontSize.small};
          line-height: 3.125rem;
        `;
      case 'medium':
        return `
          width: 6rem;
          height: 6rem;
          font-size: 2rem;
          line-height: 2rem;
        `;
      case 'large':
        return `
          width: 12.5rem;
          height: 12.5rem;
          font-size: 2.8rem;
          line-height: 2.8rem;
        `;
      case 'huge':
        return `
          width: 16rem;
          height: 16rem;
          font-size: 3rem;
          line-height: 3rem;
        `;
    }
  }}
`;
