import { FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useGameServers } from 'queries/gameservers';
import { Select, styled } from '@takaro/lib-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { PATHS } from 'paths';

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

  const { control, watch } = useForm<FormFields>({
    mode: 'onChange',
    defaultValues: {
      gameServerId: serverId,
    },
  });

  // flatten pages into a single array
  const gameServers = data?.pages.flatMap((page) => page.data);

  useEffect(() => {
    const subscription = watch(({ gameServerId }) => {
      if (gameServerId && gameServerId !== serverId) {
        const newLink = location.pathname.replace(serverId, gameServerId);
        setServerId(gameServerId);

        // in case you are  in the global nav and you change the server, you should navigate to the dashboard of that server.
        if (!isInGameServerNav) {
          navigate(PATHS.gameServer.dashboard(gameServerId));
          return;
        }

        if (newLink !== location.pathname) {
          navigate(newLink);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch('gameServerId'), location.pathname]);

  // if there is there is only 1 server, don't show the dropdown
  if (!data || !gameServers || (gameServers && gameServers.length === 1)) return null;

  return (
    <Select
      loading={isLoading}
      readOnly={gameServers.length === 1}
      control={control}
      name="gameServerId"
      render={(selectedIndex) => <div>{gameServers[selectedIndex]?.name ?? gameServers[0]?.name}</div>}
    >
      <Select.OptionGroup>
        {gameServers.map(({ name, id }) => (
          <Select.Option key={id} value={id}>
            <div>
              <span>{name}</span>
            </div>
          </Select.Option>
        ))}
      </Select.OptionGroup>
    </Select>
  );
};
