import { FC } from 'react';
import { styled } from '../../../styled';
import { AiOutlineArrowLeft as ArrowLeft, AiOutlineArrowRight as ArrowRight } from 'react-icons/ai';
import { Button } from '../..';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  button {
    margin-left: 0.2rem;
    margin-right: 0.2rem;
  }
`;

interface PaginationProps {
  // These are values you can set yourself.
  pageIndex: number;
  pageSize?: number;

  // these are just values from the useTable hook
  canPreviousPage: boolean;
  canNextPage: boolean;
  gotoPage: (page: number) => void;
  previousPage: () => void;
  nextPage: () => void;
  pageCount: number;
  pageOptions: number[];
  setPageSize: (size: number) => void;
}

export const Pagination: FC<PaginationProps> = ({
  pageIndex,
  canPreviousPage,
  pageOptions,
  canNextPage,
  gotoPage,
  previousPage,
  pageCount,
  nextPage,
  setPageSize,
  pageSize
}) => {
  return (
    <Container>
      <Button
        disabled={!canPreviousPage}
        icon={<ArrowLeft />}
        onClick={() => previousPage()}
        text="Previous page"
      />
      <Button
        disabled={!canNextPage}
        icon={<ArrowRight />}
        onClick={() => nextPage()}
        text="Next page"
      />
      <span>
        Page{' '}
        <strong>
          {pageIndex + 1} of {pageOptions.length}
        </strong>{' '}
      </span>
      <span>
        | Go to page:{' '}
        <input
          defaultValue={pageIndex + 1}
          onChange={(e) => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0;
            gotoPage(page);
          }}
          style={{ width: '100px' }}
          type="number"
        />
      </span>{' '}
      {pageSize && (
        <select
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
          value={pageSize}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      )}
    </Container>
  );
};
