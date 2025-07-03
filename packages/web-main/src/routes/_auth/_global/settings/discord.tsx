import { Fragment } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Button, Card, Empty, Skeleton, styled, useTheme, InfiniteScroll } from '@takaro/lib-components';
import { LoginDiscordCard } from './-discord/LoginDiscordCard';
import { GuildCard } from './-discord/GuildCard';
import { CardList } from '../../../../components/cards';
import { discordGuildInfiniteQueryOptions, discordInviteQueryOptions } from '../../../../queries/discord';

export const Route = createFileRoute('/_auth/_global/settings/discord')({
  loader: async ({ context }) => {
    const opts = discordGuildInfiniteQueryOptions({ sortBy: 'takaroEnabled', sortDirection: 'desc', page: 0 });
    const guilds =
      context.queryClient.getQueryData(opts.queryKey) ?? (await context.queryClient.fetchInfiniteQuery(opts));
    const invites = await context.queryClient.ensureQueryData(discordInviteQueryOptions());
    return { guilds, invites };
  },
  pendingComponent: PendingComponent,
  component: Component,

  /* TODO: not sure if this should be put here */
  notFoundComponent: () => (
    <Empty
      header="No guilds found"
      description="It seems like you don't have any guilds. Are you sure you have the rights to change guild settings on any of your discord servers"
      actions={[]}
    />
  ),
});

const Flex = styled.div`
  display: grid;
  grid-template-columns: 300px 400px;
  grid-gap: ${({ theme }) => theme.spacing[1]};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

function PendingComponent() {
  const theme = useTheme();
  return (
    <>
      <Flex style={{ marginBottom: theme.spacing[2] }}>
        <Skeleton width="100%" height="60px" variant="rectangular" />
        <Skeleton width="100%" height="60px" variant="rectangular" />
      </Flex>
      <h1>Guilds</h1>
      <CardList>
        <Skeleton width="100%" height="85px" variant="rectangular" />
        <Skeleton width="100%" height="85px" variant="rectangular" />
        <Skeleton width="100%" height="85px" variant="rectangular" />
        <Skeleton width="100%" height="85px" variant="rectangular" />
        <Skeleton width="100%" height="85px" variant="rectangular" />
        <Skeleton width="100%" height="85px" variant="rectangular" />
        <Skeleton width="100%" height="85px" variant="rectangular" />
        <Skeleton width="100%" height="85px" variant="rectangular" />
        <Skeleton width="100%" height="85px" variant="rectangular" />
      </CardList>
    </>
  );
}

function Component() {
  const loaderData = Route.useLoaderData();
  const {
    data: guilds,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    ...discordGuildInfiniteQueryOptions({}),
    initialData: loaderData.guilds,
  });

  return (
    <Fragment>
      <Flex>
        <LoginDiscordCard />
        <Card>
          <Card.Body>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '50px' }}>
              <a href={loaderData.invites?.botInvite} target="_blank" rel="noreferrer">
                <Button>Invite Discord bot</Button>
              </a>
            </div>
          </Card.Body>
        </Card>
      </Flex>
      <h1> Guilds</h1>
      <CardList>
        {guilds.pages
          .flatMap((page) => page.data)
          .map((guild) => (
            <GuildCard key={guild.id} guild={guild} />
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
}
