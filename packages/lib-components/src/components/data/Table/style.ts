import { Density, styled } from '../../../styled';

export const Wrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

export const Toolbar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[1]};
  gap: 1rem;
  border-left: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  border-right: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  border-top: 1px solid ${({ theme }) => theme.colors.backgroundAccent};

  border-top-left-radius: ${({ theme }) => theme.borderRadius.large};
  border-top-right-radius: ${({ theme }) => theme.borderRadius.large};
`;

export const Flex = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

export const TableWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent}};
  padding-bottom: ${({ theme }) => theme.spacing['0_5']};
  border-bottom-left-radius: ${({ theme }) => theme.borderRadius.large};
  border-bottom-right-radius: ${({ theme }) => theme.borderRadius.large};
  overflow: hidden;
`;

export const StyledTable = styled.table<{ density: Density }>`
  /* NOTE: The table heading style (th) is in ColumnHeader's styles */
  width: 100%;
  text-align: left;
  background-color: ${({ theme }) => theme.colors.background};
  border-collapse: collapse;
  position: relative;

  tr:last-child td {
    border-bottom: none;
  }

  td {
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
    padding: ${({ theme, density }) =>
      density === 'tight' ? `${theme.spacing['0_5']} 0` : `${theme.spacing['1_5']} 0`};

    &:first-child {
      padding-left: ${({ theme }) => theme.spacing['1']};
    }
  }

  tfoot {
    border-top: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
    tr {
      td {
        border-bottom: none;
        padding-top: ${({ theme }) => theme.spacing[2]};
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
