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
<<<<<<< HEAD
  const routeMatch = useMatchRoute();
=======
  const matchRoute = useMatchRoute();
>>>>>>> origin/main
  const navigate = useNavigate();
  const { control, watch } = useForm<FormFields>({
    mode: 'onChange',
    defaultValues: {
      gameServerId: selectedGameServerId,
    },
  });
<<<<<<< HEAD
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
=======

  useEffect(() => {
    const subscription = watch(() => {
      // a new gameserver was selected
      const params = matchRoute({
        to: '/gameserver/$gameServerId',
        fuzzy: true,
      }) as { gameServerId: string; '**': string } | false;

      if (params !== false) {
        navigate({
          to: `/gameserver/$gameServerId/${params['**']}`,
          params: {
            gameServerId: params.gameServerId,
          },
>>>>>>> origin/main
          startTransition: true,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch('gameServerId')]);

  return <GameServerSelect control={control} name="gameServerId" label="" />;
};
