import { Fragment } from 'react';
import { Helmet } from 'react-helmet';

import { Button, Empty, Skeleton, styled, useTheme } from '@takaro/lib-components';
import { LoginDiscord } from 'components/DiscordSettings/LoginDiscord';
import { useDiscordGuilds } from 'queries/discord';
import { ServerCard } from 'components/DiscordSettings/ServerCard';
import { InviteCard } from 'components/DiscordSettings/InviteCard';

const List = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: ${({ theme }) => theme.spacing[1]};
`;

const Flex = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-gap: ${({ theme }) => theme.spacing[1]};
`;

export const DiscordSettings = () => {
  const theme = useTheme();
  const {
    data: guilds,
    isLoading,
    isError,
    InfiniteScroll,
    refetch,
  } = useDiscordGuilds({
    sortBy: 'takaroEnabled',
    sortDirection: 'desc',
  });

  if (isLoading) {
    return (
      <>
        <Flex style={{ marginBottom: theme.spacing[2] }}>
          <Skeleton width="100%" height="60px" variant="rectangular" />
          <Skeleton width="100%" height="60px" variant="rectangular" />
        </Flex>
        <h1>Guilds</h1>
        <List>
          <Skeleton width="100%" height="85px" variant="rectangular" />
          <Skeleton width="100%" height="85px" variant="rectangular" />
          <Skeleton width="100%" height="85px" variant="rectangular" />
          <Skeleton width="100%" height="85px" variant="rectangular" />
          <Skeleton width="100%" height="85px" variant="rectangular" />
          <Skeleton width="100%" height="85px" variant="rectangular" />
          <Skeleton width="100%" height="85px" variant="rectangular" />
          <Skeleton width="100%" height="85px" variant="rectangular" />
          <Skeleton width="100%" height="85px" variant="rectangular" />
        </List>
      </>
    );
  }

  if (isError) {
    return <p>Something went wrong</p>;
  }

  if (!guilds) {
    return (
      <Empty
        header="No guilds found"
        description="It seems like you don't have any guilds. Are you sure you have the rights to change guild settings on any of your discord servers"
        actions={[<Button text="Try again" onClick={() => refetch()} />]}
      />
    );
  }

  return (
    <Fragment>
      <Helmet>
        <title>Settings - Takaro</title>
      </Helmet>
      <Flex>
        <LoginDiscord />
        <InviteCard />
      </Flex>
      <h1> Guilds</h1>
      <List>
        {guilds.pages
          .flatMap((page) => page.data)
          .map((guild) => (
            <ServerCard key={guild.id} guild={guild} />
          ))}
      </List>
      {InfiniteScroll}
    </Fragment>
  );
};
