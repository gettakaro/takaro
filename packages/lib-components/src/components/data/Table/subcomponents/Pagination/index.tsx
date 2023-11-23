import { FC, useMemo } from 'react';
import { Button } from '../../../../../components';
import { PaginationContainer } from './style';

const range = (start: number, end: number) => {
  return Array.from({ length: end - start }, (_, index) => index + start);
};

const getPageWindow = (pageCount: number, windowSize: number, currentPage: number): { start: number; end: number } => {
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
  /// The current page index
  pageIndex: number;

  /// The function to set the current page index
  setPageIndex: (index: number) => void;

  /// Whether there is a previous page
  hasPrevious: boolean;

  /// The function to go to the previous page
  previousPage: () => void;

  /// Whether there is a next page
  hasNext: boolean;

  /// The function to go to the next page
  nextPage: () => void;

  /// The total number of pages
  pageCount: number;

  /// The id of the table
  /// Used as identifier for the pagination buttons
  tableId: string;
}

export const Pagination: FC<PaginationProps> = ({
  setPageIndex,
  hasPrevious,
  pageIndex,
  hasNext,
  pageCount,
  previousPage,
  nextPage,
  tableId,
}) => {
  const windowSize = 5;
  const pageWindow = getPageWindow(pageCount, windowSize, pageIndex + 1);

  const pages = range(pageWindow.start, pageWindow.end);

  const showButtons = useMemo(() => {
    return pageCount > 1;
  }, [pageCount]);

  const showJumps = useMemo(() => {
    return showButtons && pageCount > windowSize;
  }, [showButtons, pageCount, windowSize]);

  const handlePageChange = (page: number) => {
    setPageIndex(page - 1);
  };

  return (
    <PaginationContainer border={false}>
      {showJumps && <Button onClick={() => setPageIndex(0)} variant="outline" disabled={!hasPrevious} text="<<" />}
      {showButtons && <Button onClick={previousPage} variant="outline" disabled={!hasPrevious} text="<" />}
      {showButtons &&
        pages.map((i) => (
          <Button
            key={`page-${tableId}-${i}`}
            variant="outline"
            onClick={() => handlePageChange(i)}
            className={i === pageIndex + 1 ? 'active' : ''}
            text={`${i}`}
          />
        ))}
      {showButtons && <Button variant="outline" onClick={nextPage} disabled={!hasNext} text=">" />}
      {showJumps && (
        <Button variant="outline" onClick={() => setPageIndex(pageCount - 1)} disabled={!hasNext} text=">>" />
      )}
    </PaginationContainer>
  );
};
