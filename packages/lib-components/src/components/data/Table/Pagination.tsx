import { FC } from 'react';
import { styled } from '../../../styled';

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: flex-end;

  button {
    background-color: ${({ theme }) => theme.colors.white};
    padding: 0 1rem;
    font-weight: 400;

    &.active {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

export interface PaginationProps {
  setPageIndex: (index: number) => void;
  pageIndex: number;
  hasPrevious: boolean;
  previousPage: () => void;
  nextPage: () => void;
  hasNext: boolean;
  pageCount: number;
}

export const Pagination: FC<PaginationProps> = ({
  setPageIndex,
  hasPrevious,
  pageIndex,
  hasNext,
  pageCount,
  previousPage,
  nextPage,
}) => {
  return (
    <PaginationContainer>
      <button onClick={() => setPageIndex(0)} disabled={!hasPrevious}>
        {'<<'}
      </button>
      {/* SPECIAL CASE 1: current page is the first page (2 new pages on right) */}
      {pageIndex === 0 && (
        <>
          <button
            onClick={() => setPageIndex(0)}
            disabled={!hasPrevious}
            className="active"
          >
            1
          </button>
          <button onClick={() => setPageIndex(1)}>2</button>
          <button onClick={() => setPageIndex(2)}>3</button>
        </>
      )}
      {/* SPECIAL CASE 2 (current page = last page) */}
      {pageIndex === pageCount - 1 && (
        <>
          <button onClick={() => setPageIndex(pageIndex - 2)}>
            {pageIndex - 1}
          </button>

          <button onClick={() => setPageIndex(pageIndex - 1)}>
            {pageIndex}
          </button>

          <button
            className="active"
            onClick={() => setPageIndex(pageIndex + 1)}
          >
            {pageIndex + 1}
          </button>
        </>
      )}
      {/* in case there is a previous page and there is a next page */}
      {pageIndex !== pageCount - 1 && pageIndex !== 0 && (
        <>
          <button onClick={previousPage}>{pageIndex}</button>
          <button className="active" onClick={() => setPageIndex(pageIndex)}>
            {pageIndex + 1}
          </button>
          <button onClick={nextPage}>{pageIndex + 2}</button>
        </>
      )}
      <button onClick={() => setPageIndex(pageCount - 1)} disabled={hasNext}>
        {'>>'}
      </button>
    </PaginationContainer>
  );
};
