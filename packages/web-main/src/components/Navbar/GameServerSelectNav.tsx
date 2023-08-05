import { FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useGameServers } from 'queries/gameservers';
import { Select, styled } from '@takaro/lib-components';
import { useNavigate, useLocation } from 'react-router-dom';

export const StyledForm = styled.form`
  div {
    margin-bottom: 0;
  }
`;

type FormFields = { gameServerId: string };

interface GameServerSelectNavProps {
  serverId: string;
  setServerId: (id: string) => void;
}

export const GameServerSelectNav: FC<GameServerSelectNavProps> = ({ serverId, setServerId }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { control, watch } = useForm<FormFields>({
    mode: 'onChange',
    defaultValues: {
      gameServerId: serverId,
    },
  });

  useEffect(() => {
    const subscription = watch(({ gameServerId }) => {
      if (gameServerId && gameServerId !== serverId) {
        const newLink = location.pathname.replace(serverId, gameServerId);
        setServerId(gameServerId);

        if (newLink !== location.pathname) {
          navigate(newLink);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch('gameServerId'), location.pathname]);

  const { data, isLoading } = useGameServers();

  // flatten pages into a single array
  const gameServers = data?.pages.flatMap((page) => page.data);

  // if there is there is only 1 server, don't show the dropdown
  if (!data || !gameServers || (gameServers && gameServers.length === 1)) return null;

  /* form tag is here to stretch width to 100% */
  return (
    <StyledForm>
      <Select
        loading={isLoading}
        control={control}
        name="gameServerId"
        render={(selectedIndex) => (
          <div>{gameServers[selectedIndex]?.name ?? gameServers.find(({ id }) => id === serverId)?.name}</div>
        )}
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
    </StyledForm>
  );
};
