import { GuildOutputDTO } from '@takaro/apiclient';
import { Card, Checkbox, Switch, styled } from '@takaro/lib-components';
import { useDiscordGuildUpdate } from 'queries/discord';
import { FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaDiscord } from 'react-icons/fa';

interface IServerCardProps {
  guild: GuildOutputDTO;
}

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

  const iconUrl = guild.icon
    ? `https://cdn.discordapp.com/icons/${guild.discordId}/${guild.icon}.png?size=32`
    : null;
  const iconElement = iconUrl ? (
    <StyledIcon src={iconUrl} alt={guild.name} />
  ) : (
    <FaDiscord size={32} />
  );

  const { control, watch, setValue } = useForm({
    defaultValues: {
      takaroEnabled: guild.takaroEnabled,
    },
  });

  const takaroEnabled = watch('takaroEnabled');

  useEffect(() => {
    mutate({ id: guild.id, input: { takaroEnabled } });
  }, [takaroEnabled]);

  useEffect(() => {
    setValue('takaroEnabled', guild.takaroEnabled);
  }, [isError]);

  return (
    <StyledCard>
      {iconElement}
      <h2>{guild.name}</h2>
      <form>
        <Switch control={control} name="takaroEnabled" />
      </form>
    </StyledCard>
  );
};
