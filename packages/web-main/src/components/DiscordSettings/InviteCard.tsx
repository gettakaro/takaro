import { styled, Card, Loading, Button } from '@takaro/lib-components';
import { useDiscordInvite } from 'queries/discord';

const StyledCard = styled(Card)`
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: ${({ theme }) => theme.spacing[12]};
`;

export const InviteCard = () => {
  const { data, isLoading } = useDiscordInvite();

  if (isLoading)
    return (
      <StyledCard>
        <Loading />
      </StyledCard>
    );

  return (
    <StyledCard>
      <a href={data?.botInvite} target="_blank" rel="noreferrer">
        <Button text="Invite bot" />
      </a>
      <a href={data?.devServer} target="_blank" rel="noreferrer">
        <Button text="Support server" />
      </a>
    </StyledCard>
  );
};
