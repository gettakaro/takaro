import { FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useGameServers } from 'queries/gameservers';
import { Select } from '@takaro/lib-components';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

type FormFields = { gameServer: string };

export const GameServerSelectNav: FC = () => {
  const { serverId: currentLocationServer } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { control, watch } = useForm<FormFields>();

  const { gameServer } = watch();

  const { data, hasNextPage } = useGameServers();

  // flatten pages into a single array
  const gameServers = data?.pages.flatMap((page) => page.data);

  useEffect(() => {
    if (gameServer && currentLocationServer && gameServers) {
      const id = gameServers?.find(({ name }) => name === gameServer)?.id;

      if (id) {
        const newLink = location.pathname.replace(currentLocationServer, id);
        navigate(newLink);
      }
    }
  }, [
    gameServer,
    navigate,
    currentLocationServer,
    location.pathname,
    gameServers,
  ]);

  // if there is there is only 1 server, don't show the dropdown
  if (!data || !gameServers || (gameServers && gameServers.length === 1))
    return null;

  /* form tag is here to stretch width to 100% */
  return (
    <form>
      <Select
        control={control}
        name="gameServer"
        render={(selectedIndex) => (
          <div>
            {gameServers[selectedIndex]?.name ??
              gameServers.find(({ id }) => id === currentLocationServer)?.name}
          </div>
        )}
      >
        <Select.OptionGroup>
          {gameServers.map(({ name, id }) => (
            <Select.Option key={id} value={name}>
              <div>
                <span>{name}</span>
              </div>
            </Select.Option>
          ))}
        </Select.OptionGroup>
      </Select>
    </form>
  );
};
