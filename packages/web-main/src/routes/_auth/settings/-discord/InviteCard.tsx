import { styled, Card, Button, Spinner } from '@takaro/lib-components';
import { useDiscordInvite } from 'queries/discord';

const Body = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
`;

export const InviteCard = () => {
  const { data, isLoading } = useDiscordInvite();

  if (isLoading)
    return (
      <Card>
        <Body>
          <Spinner size="medium" />
        </Body>
      </Card>
    );

  return (
    <Card>
      <Body>
        <a href={data?.botInvite} target="_blank" rel="noreferrer">
          <Button text="Invite bot" />
        </a>
        <a href={data?.devServer} target="_blank" rel="noreferrer">
          <Button text="Join discord support server" />
        </a>
      </Body>
    </Card>
  );
};
