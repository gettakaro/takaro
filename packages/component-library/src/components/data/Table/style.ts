import { styled } from '../../../styled';

export const StyledTable = styled.table`
  width: 100%;
  border-spacing: 0 2rem;
  border-collapse: separate;
`;

export const Thead = styled.thead`
  padding: 0.8rem 2rem;
  margin-bottom: 1.5rem;
  background-color: ${({ theme }): string => theme.colors.background};
  color: white;
  font-size: 1.5rem;

  th {
    border-radius: 2rem;
    padding: 2rem;
    font-weight: 600;
  }
`;

export const Tbody = styled.tbody`
  tr {
    border: 3px solid #000;
    text-align: center;

    td:first-child {
      border-left: 0.2rem solid ${({ theme }) => theme.colors.background};
      border-top-left-radius: 0.75rem;
      border-bottom-left-radius: 0.75rem;
    }
    td:last-child {
      border-top-right-radius: 0.75rem;
      border-bottom-right-radius: 0.75rem;
      border-right: 0.2rem solid ${({ theme }) => theme.colors.background};
    }

    td {
      background-color: ${({ theme }) => theme.colors.background};
      padding: 2rem 0;
    }
  }
`;

export const Pagination = styled.div``;
