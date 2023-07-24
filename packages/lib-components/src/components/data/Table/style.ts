import { Density, styled } from '../../../styled';

export const Wrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 1rem;
`;

export const StyledTable = styled.table<{ density: Density }>`
  width: 100%;
  text-align: left;
  background-color: ${({ theme }) => theme.colors.background};
  overflow: hidden;

  &,td,th {
    border-collapse: collapse;
  }

  &,
  td {
    padding: ${({ theme, density }) => {
      if (density === 'tight') {
        return `${theme.spacing['0_75']} ${theme.spacing['0_5']}`;
      }
      return `${theme.spacing['2']} ${theme.spacing['1_5']};`;
    }}

    &:first-of-type {
      border-left: 1px solid transparent;
    }
    &:last-of-type {
      border-right: 1px solid transparent;
    }
  }

  td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
  }

  th {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};

  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing[2]}`};

    &:last-of-type {
      border-top-right-radius: ${({ theme }) => theme.borderRadius.medium};
      border-bottom-right-radius: ${({ theme }) => theme.borderRadius.medium};
    }
  }

  tfoot {
    tr {
      td {
        padding-top: ${({ theme }) => theme.spacing[1]};
      }
    }
  }
`;

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const Flex = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;
