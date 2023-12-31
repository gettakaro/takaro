import { GuildOutputDTO } from '@takaro/apiclient';
import { Card, styled, UnControlledSwitch } from '@takaro/lib-components';
import { useDiscordGuildUpdate } from 'queries/discord';
import { FC, useEffect, useState } from 'react';
import { FaDiscord } from 'react-icons/fa';
import { useSnackbar } from 'notistack';

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
  const { mutate, isError } = useDiscordGuildUpdate();
  const [takaroEnabled, setTakaroEnabled] = useState<boolean>(guild.takaroEnabled);
  const { enqueueSnackbar } = useSnackbar();

  const iconUrl = guild.icon ? `https://cdn.discordapp.com/icons/${guild.discordId}/${guild.icon}.png?size=32` : null;
  const iconElement = iconUrl ? <StyledIcon src={iconUrl} alt={guild.name} /> : <FaDiscord size={32} />;

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    mutate({ id: guild.id, input: { takaroEnabled: e.target.checked } });
    setTakaroEnabled(e.target.checked);
  };

  useEffect(() => {
    if (isError) {
      setTakaroEnabled(guild.takaroEnabled);
      enqueueSnackbar(
        <>
          Failed to {guild.takaroEnabled ? 'disable' : 'enable'} guild: <strong>{guild.name}</strong>
        </>,
        { variant: 'default', type: 'error' }
      );
    }
  }, [isError, guild.takaroEnabled, enqueueSnackbar, guild.name]);

  return (
    <StyledCard>
      {iconElement}
      <h2>{guild.name}</h2>
      <form>
        <Box>
          <UnControlledSwitch
            hasDescription={false}
            hasError={isError}
            name="takaroEnabled"
            onChange={handleOnChange}
            disabled={isError}
            id="guild-takaro"
            value={takaroEnabled}
          />
        </Box>
      </form>
    </StyledCard>
  );
};
