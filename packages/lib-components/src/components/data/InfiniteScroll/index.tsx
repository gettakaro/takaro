import { forwardRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useMergeRefs } from '@floating-ui/react';
import { Button, Spinner } from '../../../components';

export interface InfiniteScrollProps {
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  isFetching: boolean;
  hasNextPage?: boolean;
}

export const InfiniteScroll = forwardRef<HTMLElement, InfiniteScrollProps>(function InfiniteScroll(
  { hasNextPage = false, fetchNextPage, isFetching, isFetchingNextPage },
  propRef,
) {
  const { ref: viewRef, inView } = useInView();
  const ref = useMergeRefs([propRef, viewRef]);

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView]);

  // Fallback: sometimes the inView event does not trigger automatically.
  // the user will have to manually click the button to fetch the next page.
  const handleOnClick = () => {
    fetchNextPage();
  };

  return (
    <>
      {!isFetchingNextPage && hasNextPage && !isFetching && (
        <div
          ref={ref}
          style={{ display: 'flex', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}
        >
          <Button text="Load more" ref={ref} onClick={handleOnClick} />
        </div>
      )}
      {hasNextPage && isFetchingNextPage && (
        <div
          ref={ref}
          style={{ display: 'flex', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}
        >
          <Spinner size="medium" />
        </div>
      )}
    </>
  );
});
