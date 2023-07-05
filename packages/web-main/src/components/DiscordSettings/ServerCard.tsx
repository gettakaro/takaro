import { GuildOutputDTO } from '@takaro/apiclient';
import { Card, styled, UnControlledSwitch } from '@takaro/lib-components';
import { useDiscordGuildUpdate } from 'queries/discord';
import { FC } from 'react';
import { FaDiscord } from 'react-icons/fa';

interface IServerCardProps {
  guild: GuildOutputDTO;
}

const Box = styled.div`
  div {
    margin-bottom: 0;
  }
`;

const StyledCard = styled(Card)`
  display: grid;
  grid-template-columns: 1.5fr 5fr 1fr;
  align-items: center;
`;

const StyledIcon = styled.img`
  border-radius: 50%;
`;

export const ServerCard: FC<IServerCardProps> = ({ guild }) => {
  const { mutate } = useDiscordGuildUpdate();

  const iconUrl = guild.icon ? `https://cdn.discordapp.com/icons/${guild.discordId}/${guild.icon}.png?size=32` : null;
  const iconElement = iconUrl ? <StyledIcon src={iconUrl} alt={guild.name} /> : <FaDiscord size={32} />;

  const handleOnSwitchChange = (val: boolean) => {
    mutate({ id: guild.id, input: { takaroEnabled: val } });
  };

  return (
    <StyledCard>
      {iconElement}
      <h2>{guild.name}</h2>
      <form>
        <Box>
          <UnControlledSwitch
            hasDescription={false}
            name="guildEnabled"
            id={`guild-${guild.id}`}
            value={guild.takaroEnabled}
            onChange={handleOnSwitchChange}
            hasError={false}
          />
        </Box>
      </form>
    </StyledCard>
  );
};
