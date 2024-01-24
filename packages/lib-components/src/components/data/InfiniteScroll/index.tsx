import { forwardRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useMergeRefs } from '@floating-ui/react';
import { Spinner } from '../../../components';

export interface InfiniteScrollProps {
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  isFetching: boolean;
  hasNextPage?: boolean;
}

export const InfiniteScroll = forwardRef<HTMLDivElement, InfiniteScrollProps>(
  ({ hasNextPage = false, fetchNextPage }, propRef) => {
    const { ref: viewRef, inView } = useInView();
    const ref = useMergeRefs([propRef, viewRef]);

    useEffect(() => {
      if (inView) {
        fetchNextPage();
      }
    }, [inView]);

    return (
      <>
        {hasNextPage && (
          <div
            ref={ref}
            style={{ display: 'flex', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}
          >
            <Spinner size="medium" />
          </div>
        )}
      </>
    );
  }
);
