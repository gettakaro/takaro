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

  const { data: gameServers } = useGameServers();

  useEffect(() => {
    if (gameServer && currentLocationServer) {
      const id = gameServers?.find(({ name }) => name === gameServer)?.id;

      if (id) {
        const newLink = location.pathname.replace(currentLocationServer, id);
        navigate(newLink);
      }
    }
  }, [gameServer]);

  if (!gameServers) return null;

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
        <Select.OptionGroup label="Gameservers">
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
