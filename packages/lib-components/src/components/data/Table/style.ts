import { styled } from '../../../styled';
import { darken } from 'polished';

export const Wrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 1rem;
  margin-bottom: 1rem;
`;

export const FilterContainer = styled.div`
  padding: 2rem 0;
`;

export const StyledTable = styled.table<{ spacing: 'tight' | 'relaxed' }>`
  width: 100%;
  border-spacing: 0; /* disable inner borders */
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  text-align: left;
  background-color: ${({ theme }) => theme.colors.background};

  thead {
    color: ${({ theme }) => theme.colors.text};
    th {
      background-color: ${({ theme }) => theme.colors.backgroundAlt};
      color: ${({ theme }) => darken(0.3, theme.colors.text)};

      padding: ${({ theme }) => theme.spacing[2]};

      & > div {
        font-weight: 600;
      }
    }
  }

  tbody {
    background-color: ${({ theme }) => theme.colors.background};

    tr {
      text-align: left;

      &:last-child {
        td {
          border-bottom: 0;
        }
      }

      td {
        padding: ${({ theme }) => theme.spacing[2]};
      }
    }
  }

  tfoot {
    tr {
      td {
        padding-top: ${({ theme }) => theme.spacing[4]};
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
