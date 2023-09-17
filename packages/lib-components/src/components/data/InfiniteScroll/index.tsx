import { forwardRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useMergeRefs } from '@floating-ui/react';
import { Button } from '../../../components';

export interface InfiniteScrollProps {
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  isFetching: boolean;
  hasNextPage?: boolean;
}

export const InfiniteScroll = forwardRef<HTMLButtonElement, InfiniteScrollProps>(
  ({ hasNextPage = false, isFetching, isFetchingNextPage, fetchNextPage }, propRef) => {
    const { ref: viewRef, inView } = useInView();
    const ref = useMergeRefs([propRef, viewRef]);

    useEffect(() => {
      if (inView) {
        fetchNextPage();
      }
    }, [inView]);

    // This is a fallback in case the user doesn't scroll down enough to trigger the inView event.
    // the user will have to manually click the button to load more.
    const handleOnClick = () => {
      fetchNextPage();
    };

    return (
      <>
        {hasNextPage && (
          <Button
            isLoading={isFetchingNextPage}
            text={isFetchingNextPage ? 'Loading more...' : 'Load more'}
            ref={ref}
            onClick={handleOnClick}
          />
        )}
        <div>{isFetching && !isFetchingNextPage ? 'background updating' : null}</div>
      </>
    );
  }
);
