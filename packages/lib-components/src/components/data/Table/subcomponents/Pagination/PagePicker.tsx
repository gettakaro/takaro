import { FC, useMemo } from 'react';
import { Button, IconButton } from '../../../../../components';
import { PagePickerContainer } from './style';
import {
  FaAngleRight as NextIcon,
  FaAnglesRight as LastIcon,
  FaChevronLeft as PreviousIcon,
  FaAnglesLeft as FirstIcon,
} from 'react-icons/fa6';

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
  }
  return { start: currentPage - ceiling + 1, end: currentPage + floor + 1 };
};

export interface PagePickerProps {
  setPageIndex: (index: number) => void;
  pageIndex: number;
  hasPrevious: boolean;
  previousPage: () => void;
  nextPage: () => void;
  hasNext: boolean;
  pageCount: number;
}

export const PagePicker: FC<PagePickerProps> = ({
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

  const showButtons = useMemo(() => {
    return pageCount > 1;
  }, [pageCount]);

  const showJumps = useMemo(() => {
    return showButtons && pageCount > windowSize;
  }, [showButtons, pageCount, windowSize]);

  const handlePreviousPageClick = () => {
    previousPage();
  };

  return (
    <PagePickerContainer border={false}>
      {showJumps && (
        <IconButton
          size="tiny"
          onClick={() => setPageIndex(0)}
          icon={<FirstIcon />}
          disabled={!hasPrevious}
          ariaLabel="First page"
        />
      )}
      {showButtons && (
        <IconButton
          size="tiny"
          onClick={handlePreviousPageClick}
          icon={<PreviousIcon />}
          disabled={!hasPrevious}
          ariaLabel="Previous page"
        />
      )}
      {showButtons &&
        pages.map((i) => (
          <Button
            key={`page-${i}`}
            variant="outline"
            onClick={() => setPageIndex(i - 1)}
            className={i === pageIndex + 1 ? 'active' : ''}
          >
            {i}
          </Button>
        ))}
      {showButtons && (
        <IconButton size="tiny" icon={<NextIcon />} onClick={nextPage} disabled={!hasNext} ariaLabel="next page" />
      )}
      {showJumps && (
        <IconButton
          size="tiny"
          icon={<LastIcon />}
          onClick={() => setPageIndex(pageCount - 1)}
          disabled={!hasNext}
          ariaLabel="Last page"
        />
      )}
    </PagePickerContainer>
  );
};
