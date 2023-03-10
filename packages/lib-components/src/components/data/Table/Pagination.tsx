import { FC } from 'react';
import { styled } from '../../../styled';
import { Button } from '../../../components/';

export interface PaginationProps {
  setPageIndex: (index: number) => void;
  pageIndex: number;
  previousPage: () => void;
  nextPage: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  isLoading: boolean;
  pageCount: number;
  pageSize: number;
  setPageSize: (size: number) => void;
}

const Container = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const Pagination: FC<PaginationProps> = ({
  setPageIndex,
  previousPage,
  nextPage,
  hasPrevious,
  hasNext,
  pageCount,
  pageIndex,
  isLoading,
}) => {
  return (
    <Container>
      <Button
        onClick={() => setPageIndex(0)}
        disabled={!hasPrevious}
        text="prev"
      />
      <Button
        onClick={() => previousPage()}
        disabled={!hasPrevious}
        text={`${pageIndex + 1}`}
      />
      <Button onClick={() => nextPage()} disabled={!hasNext} text="next" />

      {/*
      <button
        className="border rounded p-1"
        onClick={() => setPageIndex(pageCount - 1)}
        disabled={!hasNext}
      >
        {'>>'}
      </button>
      */}

      <span className="flex items-center gap-1">
        <div>Page</div>
        <strong>
          {pageIndex + 1} of {pageCount}
        </strong>
      </span>
      {isLoading ? 'Loading...' : null}
    </Container>
  );
};
