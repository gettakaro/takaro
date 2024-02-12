import { Fragment, ReactNode } from 'react';
import { Button, Empty, Skeleton, styled, useTheme } from '@takaro/lib-components';
import { LoginDiscordCard } from './-discord/LoginDiscordCard';
import { useDiscordGuilds } from 'queries/discord';
import { GuildCard } from './-discord/GuildCard';
import { InviteCard } from './-discord/InviteCard';
import { CardList } from 'components/cards';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/settings/discord')({
  loader: () => {
    const {
      data: guilds,
      InfiniteScroll,
      refetch,
    } = useDiscordGuilds({
      sortBy: 'takaroEnabled',
      sortDirection: 'desc',
    });

    return { guilds, InfiniteScroll, refetch };
  },
  pendingComponent: PendingComponent,
  component: Component,
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
  const { guilds, InfiniteScroll, refetch } = Route.useLoaderData();
  let guildDisplay: ReactNode = null;

  // TODO: i think we should be able to handle this better
  if (guilds === undefined) {
    return <div>something went wrong</div>;
  }

  if (guilds.pages.length === 0 || guilds.pages[0].data.length === 0) {
    guildDisplay = (
      <Empty
        header="No guilds found"
        description="It seems like you don't have any guilds. Are you sure you have the rights to change guild settings on any of your discord servers"
        actions={[<Button text="Try again" onClick={() => refetch()} />]}
      />
    );
  } else {
    guildDisplay = (
      <CardList>
        {guilds.pages
          .flatMap((page) => page.data)
          .map((guild) => (
            <GuildCard key={guild.id} guild={guild} />
          ))}
      </CardList>
    );
  }

  return (
    <Fragment>
      <Flex>
        <LoginDiscordCard />
        <InviteCard />
      </Flex>
      <h1> Guilds</h1>
      {guildDisplay}
      {InfiniteScroll}
    </Fragment>
  );
}
