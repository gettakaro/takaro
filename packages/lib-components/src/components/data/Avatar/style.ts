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
    border: 0.1rem solid ${({ theme }) => theme.colors.backgroundAccent};
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

export const Container = styled.div<{ size: Size }>`
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }

  span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.background};
    border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  }

  ${({ size, theme }) => {
    switch (size) {
      case 'tiny':
        return `
          width: 1.6rem;
          height: 1.6rem;
          font-size: .8rem;
        `;
      case 'small':
        return `
          width: 3.125rem;
          height: 3.125rem;
          font-size: ${theme.fontSize.small};
        `;
      case 'medium':
        return `
          width: 6rem;
          height: 6rem;
          font-size: 2rem;
        `;
      case 'large':
        return `
          width: 14rem;
          height: 14rem;
          font-size: 2.8rem;
        `;
      case 'huge':
        return `
          width: 16rem;
          height: 16rem;
          font-size: 3rem;
        `;
    }
  }}
`;
