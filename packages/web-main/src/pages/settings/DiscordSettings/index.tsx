import { Fragment, ReactNode } from 'react';
import { Button, Empty, Skeleton, styled, useTheme } from '@takaro/lib-components';
import { LoginDiscord } from './LoginDiscord';
import { useDiscordGuilds } from 'queries/discord';
import { ServerCard } from './ServerCard';
import { InviteCard } from './InviteCard';

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

  let guildDisplay: ReactNode = null;

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
      <List>
        {guilds.pages
          .flatMap((page) => page.data)
          .map((guild) => (
            <ServerCard key={guild.id} guild={guild} />
          ))}
      </List>
    );
  }

  return (
    <Fragment>
      <Flex>
        <LoginDiscord />
        <InviteCard />
      </Flex>
      <h1> Guilds</h1>
      {guildDisplay}
      {InfiniteScroll}
    </Fragment>
  );
};
