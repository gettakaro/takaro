import { useNavigate, Outlet } from '@tanstack/react-router';
import { gameServersInfiniteQueryOptions } from '../../../../queries/gameserver';
import { CardList, GameServerCard } from '../../../../components/cards';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Button, Empty, EmptyPage, InfiniteScroll, Skeleton } from '@takaro/lib-components';
import { Fragment } from 'react';

export const GameServersCardView = () => {
  const navigate = useNavigate();

  const {
    data: gameServers,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
  } = useInfiniteQuery({
    ...gameServersInfiniteQueryOptions(),
  });

  if (isLoading) {
    return (
      <CardList>
        <Skeleton variant="rectangular" height="100%" width="100%" />
        <Skeleton variant="rectangular" height="100%" width="100%" />
        <Skeleton variant="rectangular" height="100%" width="100%" />
        <Skeleton variant="rectangular" height="100%" width="100%" />
      </CardList>
    );
  }

  if (!gameServers || gameServers.pages.length === 0) {
    return (
      <EmptyPage>
        <Empty
          header="Bro, what are you waiting on?"
          description="Create a game server to really get started with Takaro."
          actions={[
            <Button
              key="gameservers-create"
              text="Create a game server"
              onClick={() => navigate({ to: '/gameservers/create' })}
            />,
          ]}
        />
        <Outlet />
      </EmptyPage>
    );
  }

  return (
    <Fragment>
      <CardList>
        {gameServers.pages
          .flatMap((page) => page.data)
          .map((gameServer) => (
            <GameServerCard key={gameServer.id} {...gameServer} />
          ))}
      </CardList>
      <InfiniteScroll
        isFetching={isFetching}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </Fragment>
  );
};
