import { FC } from 'react';
import { Button } from '../../../actions';
import { styled } from '../../../../styled';

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
    border-radius: 0;

    &.active {
      background-color: ${({ theme }) => theme.colors.primary};
      border-color: ${({ theme }) => theme.colors.primary};
      span {
        color: ${({ theme }) => theme.colors.text};
      }
      z-index: 1;
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

const range = (start: number, end: number) => {
  return Array.from({ length: end - start }, (_, index) => index + start);
};

const getPageWindow = (
  pageCount: number,
  windowSize: number,
  currentPage: number
): { start: number; end: number } => {
  const ceiling = Math.ceil(windowSize / 2);
  const floor = Math.floor(windowSize / 2);

  if (pageCount < windowSize) {
    return { start: 1, end: pageCount + 1 };
  } else if (currentPage >= 1 && currentPage <= ceiling) {
    return { start: 1, end: windowSize + 1 };
  } else if (currentPage + floor >= pageCount) {
    return { start: pageCount - windowSize + 1, end: pageCount + 1 };
  } else {
    return { start: currentPage - ceiling + 1, end: currentPage + floor + 1 };
  }
};

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
  const windowSize = 5;
  const pageWindow = getPageWindow(pageCount, windowSize, pageIndex + 1);

  const pages = range(pageWindow.start, pageWindow.end);

  const showJumps = pageCount > windowSize;
  const showButtons = pageCount > 1;

  return (
    <PaginationContainer border={false}>
      {showJumps && (
        <Button
          onClick={() => setPageIndex(0)}
          variant="outline"
          disabled={!hasPrevious}
          text="<<"
        />
      )}
      {showButtons && (
        <Button
          onClick={previousPage}
          variant="outline"
          disabled={!hasPrevious}
          text="<"
        />
      )}
      {showButtons &&
        pages.map((i) => (
          <Button
            variant="outline"
            onClick={() => setPageIndex(i - 1)}
            className={i === pageIndex + 1 ? 'active' : ''}
            text={`${i}`}
          />
        ))}
      {showButtons && (
        <Button
          variant="outline"
          onClick={nextPage}
          disabled={!hasNext}
          text=">"
        />
      )}
      {showJumps && (
        <Button
          variant="outline"
          onClick={() => setPageIndex(pageCount - 1)}
          disabled={!hasNext}
          text=">>"
        />
      )}
    </PaginationContainer>
  );
};
