import { FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useGameServers } from 'queries/gameservers';
import { styled } from '@takaro/lib-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { PATHS } from 'paths';
import { GameServerSelect } from 'components/selects';

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
  const location = useLocation();
  const { data, isLoading } = useGameServers();

  const { control, watch, setValue } = useForm<FormFields>({
    mode: 'onChange',
    defaultValues: {
      gameServerId: serverId,
    },
  });

  // flatten pages into a single array
  const gameServers = data?.pages.flatMap((page) => page.data);

  // handle gameserver change event from the server dropdown
  useEffect(() => {
    const subscription = watch(({ gameServerId }) => {
      if (gameServerId && gameServerId !== serverId) {
        const newLink = location.pathname.replace(serverId, gameServerId);
        setServerId(gameServerId);

        // in case you are  in the global nav and you change the server, you should navigate to the dashboard of that server.
        if (!isInGameServerNav) {
          navigate(PATHS.gameServer.dashboard.overview(gameServerId));
          return;
        }

        if (newLink !== location.pathname) {
          navigate(newLink);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch('gameServerId'), location.pathname]);

  // if the serverId changes from the outside, update the form value
  useEffect(() => {
    setValue('gameServerId', serverId);
  }, [serverId]);

  // if there is there is only 1 server, don't show the dropdown
  if (!data || !gameServers || (gameServers && gameServers.length === 1)) return null;

  return <GameServerSelect loading={isLoading} control={control} name="gameServerId" />;
};
