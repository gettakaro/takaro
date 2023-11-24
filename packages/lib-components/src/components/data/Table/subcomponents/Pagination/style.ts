import { styled } from '../../../../../styled';

export const PaginationContainer = styled.div<{ border?: boolean }>`
  display: flex;
  justify-content: flex-end;

  span {
    color: ${({ theme }) => theme.colors.text};
  }

  button {
    background-color: ${({ theme }) => theme.colors.background};
    padding: ${({ theme }) => `${theme.spacing['0_5']} ${theme.spacing[1]}`};
    font-weight: 400;
    border-color: ${({ theme }) => theme.colors.textAlt};
    border-right: 0;
    border-radius: ${({ theme }) => theme.borderRadius.small};

    margin-left: ${({ theme }) => theme.spacing['0_25']};
    margin-right: ${({ theme }) => theme.spacing['0_25']};
    &:first-child {
      margin-left: 0;
    }

    &:last-child {
      margin-right: 0;
    }

    &.active {
      background-color: ${({ theme }) => theme.colors.primary};
      border-color: ${({ theme }) => theme.colors.primary};
      span {
        color: ${({ theme }) => theme.colors.text};
      }
    }

    ${({ border }) => !border && 'border: 0;'}
  }

  button:first-of-type {
    border-radius: 0.25rem 0 0 0.25rem;
  }

  button:last-of-type {
    border-right: ${({ theme }) => `solid 1px ${theme.colors.textAlt}`};
    border-radius: 0 0.25rem 0.25rem 0;

    ${({ border }) => !border && 'border: 0;'}
  }
`;
