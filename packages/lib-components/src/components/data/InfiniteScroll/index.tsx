import { forwardRef, useEffect } from 'react';
import {
  FetchNextPageOptions,
  InfiniteQueryObserverResult,
} from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useMergeRefs } from '@floating-ui/react';

export interface InfiniteScrollProps {
  isFetchingNextPage: boolean;
  fetchNextPage: (
    options?: FetchNextPageOptions | undefined
  ) => Promise<InfiniteQueryObserverResult<any, unknown>>;
  isFetching: boolean;
  hasNextPage?: boolean;
}

export const InfiniteScroll = forwardRef<
  HTMLButtonElement,
  InfiniteScrollProps
>(
  (
    { hasNextPage = false, isFetching, isFetchingNextPage, fetchNextPage },
    propRef
  ) => {
    const { ref: viewRef, inView } = useInView();
    const ref = useMergeRefs([propRef, viewRef]);

    useEffect(() => {
      if (inView) {
        fetchNextPage();
      }
    }, [inView]);

    const handleOnClick = () => {
      fetchNextPage();
    };

    return (
      <div>
        <button ref={ref} onClick={handleOnClick}>
          {isFetchingNextPage
            ? 'Loading more...'
            : hasNextPage
            ? 'Load newer'
            : 'Nothing more to load'}
        </button>
        <div>
          {isFetching && !isFetchingNextPage ? 'background updating' : null}
        </div>
      </div>
    );
  }
);
