import { Density, styled } from '../../../styled';

export const Wrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

export const Toolbar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 1rem;
`;

export const Flex = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

export const StyledTable = styled.table<{ density: Density }>`
  width: 100%;
  text-align: left;
  background-color: ${({ theme }) => theme.colors.background};
  overflow: hidden;

  /* NOTE: The actual table heading style is in ColumnHeader's styles */
  &,
  td,
  th {
    border-collapse: collapse;
  }

  &,
  td {
    padding: ${({ theme, density }) => {
      if (density === 'tight') {
        return `${theme.spacing['0_5']} 0`;
      }
      return `${theme.spacing['1_5']} 0`;
    }};

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
  }

  tfoot {
    tr {
      td {
        border-bottom: none;
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
