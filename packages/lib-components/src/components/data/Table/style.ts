import { styled } from '../../../styled';
import { darken } from 'polished';

export const Wrapper = styled.div<{ refetching: boolean }>`
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
  border-radius: 0.5rem;
  text-align: left;
  background-color: ${({ theme }) => theme.colors.background};

  thead {
    color: ${({ theme }) => theme.colors.text};
    font-size: 1.5rem;
    th {
      font-weight: 600;
      background-color: ${({ theme }) => theme.colors.backgroundAlt};
      color: ${({ theme }) => darken(0.3, theme.colors.text)};
      border-top: 2rem solid ${({ theme }) => theme.colors.backgroundAlt};
      border-bottom: 2rem solid ${({ theme }) => theme.colors.backgroundAlt};

      &:first-child {
        border-top-left-radius: 0.5rem;
        border-bottom-left-radius: 0.5rem;
        border-left: 2rem solid ${({ theme }) => theme.colors.backgroundAlt};
      }

      &:last-child {
        border-bottom-right-radius: 0.5rem;
        border-top-right-radius: 0.5rem;
      }

      & > div {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }
  }

  tbody {
    tr {
      text-align: left;

      &:last-child {
        td {
          border-bottom: 0;
        }
      }

      td {
        padding: 0;
        border-top: 1.8rem solid ${({ theme }) => theme.colors.background};
        border-bottom: 1.8rem solid ${({ theme }) => theme.colors.background};

        &:first-child {
          border-left: 1rem solid ${({ theme }) => theme.colors.background};
        }
      }
    }
  }

  tfoot {
    tr {
      td {
        padding-top: 3.5rem;
      }
    }
  }
`;
