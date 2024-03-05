import { FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { styled } from '@takaro/lib-components';
import { GameServerSelect } from 'components/selects';
import { useMatchRoute, useNavigate } from '@tanstack/react-router';

export const StyledForm = styled.form`
  div {
    margin-bottom: 0;
  }
`;

type FormFields = { gameServerId: string };

interface GameServerSelectNavProps {
  currentSelectedGameServerId: string;
}

export const GlobalGameServerSelect: FC<GameServerSelectNavProps> = ({
  currentSelectedGameServerId: selectedGameServerId,
}) => {
  const routeMatch = useMatchRoute();
  const navigate = useNavigate();
  const { control, watch } = useForm<FormFields>({
    mode: 'onChange',
    defaultValues: {
      gameServerId: selectedGameServerId,
    },
  });
  installedModules: {
  }

  useEffect(() => {
    const subscription = watch(({ gameServerId }) => {
      // a new gameserver was selected
      const match = routeMatch({ to: '/gameserver/$gameServerId', fuzzy: true });
      if (match) {
        navigate({
          to: `/gameserver/$gameServerId/${match['**']}`,
          params: { gameServerId },
          startTransition: true,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch('gameServerId')]);

  return <GameServerSelect control={control} name="gameServerId" label="" />;
};
