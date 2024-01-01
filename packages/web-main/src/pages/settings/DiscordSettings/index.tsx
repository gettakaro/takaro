import { Fragment, ReactNode } from 'react';
import { Button, Empty, Skeleton, styled, useTheme } from '@takaro/lib-components';
import { LoginDiscordCard } from './LoginDiscordCard';
import { useDiscordGuilds } from 'queries/discord';
import { GuildCard } from './GuildCard';
import { InviteCard } from './InviteCard';
import { CardList } from 'components/cards';

const Flex = styled.div`
  display: grid;
  grid-template-columns: 300px 400px;
  grid-gap: ${({ theme }) => theme.spacing[1]};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
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
};
