import { FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { gameServersOptions } from 'queries/gameservers';
import { styled } from '@takaro/lib-components';
import { useNavigate } from '@tanstack/react-router';
import { GameServerSelect } from 'components/selects';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { useQuery } from '@tanstack/react-query';

export const StyledForm = styled.form`
  div {
    margin-bottom: 0;
  }
`;

type FormFields = { gameServerId: string };

interface GameServerSelectNavProps {
  serverId: string;
  setServerId: (id: string) => void;
  isInGameServerNav: boolean;
}

export const GameServerSelectNav: FC<GameServerSelectNavProps> = ({ serverId, setServerId, isInGameServerNav }) => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(gameServersOptions());

  const gameServers = data?.data ?? [];

  const { selectedGameServerId, setSelectedGameServerId } = useSelectedGameServer();

  const { control, watch, setValue } = useForm<FormFields>({
    mode: 'onChange',
    values: {
      gameServerId: serverId,
    },
  });

  // handle gameserver change event from the server dropdown
  useEffect(() => {
    const subscription = watch(({ gameServerId }) => {
      if (gameServerId && gameServerId !== serverId) {
        const newLink = window.location.pathname.replace(serverId, gameServerId);
        setServerId(gameServerId);

        // in case you are  in the global nav and you change the server, you should navigate to the dashboard of that server.
        if (!isInGameServerNav) {
          navigate({ to: '/gameserver/$gameServerId/dashboard/overview', params: { gameServerId } });
          return;
        }

        if (newLink !== window.location.pathname) {
          // TODO
          // navigate({ to: newLink });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch('gameServerId'), window.location.pathname]);

  // if the serverId changes from the outside, update the form value
  useEffect(() => {
    setValue('gameServerId', serverId);
  }, [serverId]);

  if (gameServers && gameServers.length === 1 && (selectedGameServerId === '' || selectedGameServerId === undefined)) {
    setSelectedGameServerId(gameServers[0].id);
  }

  // if there is there is only 1 server, don't show the dropdown
  if (!data || !gameServers || (gameServers && gameServers.length === 1)) return null;

  return <GameServerSelect loading={isLoading} control={control} name="gameServerId" />;
};
