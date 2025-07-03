import { GuildOutputDTO } from '@takaro/apiclient';
import { Card, styled, UnControlledSwitch, Avatar } from '@takaro/lib-components';
import { useDiscordGuildUpdate } from '../../../../../queries/discord';
import { FC, useEffect, useState } from 'react';
import { FaDiscord } from 'react-icons/fa';
import { useSnackbar } from 'notistack';

interface IServerCardProps {
  guild: GuildOutputDTO;
}

const CardBody = styled.div`
  display: grid;
  grid-template-columns: 80px 5fr 1fr;
  align-items: center;
`;

export const GuildCard: FC<IServerCardProps> = ({ guild }) => {
  const { mutate, isError } = useDiscordGuildUpdate();
  const [takaroEnabled, setTakaroEnabled] = useState<boolean>(guild.takaroEnabled);
  const { enqueueSnackbar } = useSnackbar();

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    mutate({ guildId: guild.id, input: { takaroEnabled: e.target.checked } });
    setTakaroEnabled(e.target.checked);
  };

  useEffect(() => {
    if (isError) {
      setTakaroEnabled(guild.takaroEnabled);
      enqueueSnackbar(
        <>
          Failed to {guild.takaroEnabled ? 'disable' : 'enable'} guild: <strong>{guild.name}</strong>
        </>,
        { variant: 'default', type: 'error' },
      );
    }
  }, [isError, guild.takaroEnabled, enqueueSnackbar, guild.name]);

  return (
    <Card>
      <CardBody>
        <Avatar size="medium">
          <Avatar.Image src={`https://cdn.discordapp.com/icons/${guild.discordId}/${guild.icon}.png?size=32`} />
          <Avatar.FallBack>
            <FaDiscord />
          </Avatar.FallBack>
        </Avatar>
        <h2>{guild.name}</h2>
        <form>
          <UnControlledSwitch
            hasDescription={false}
            hasError={isError}
            name="takaroEnabled"
            onChange={handleOnChange}
            disabled={isError}
            id="guild-takaro"
            value={takaroEnabled}
          />
        </form>
      </CardBody>
    </Card>
  );
};
