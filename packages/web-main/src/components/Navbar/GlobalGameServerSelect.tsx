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
  const matchRoute = useMatchRoute();
  const navigate = useNavigate();
  const { control, watch } = useForm<FormFields>({
    mode: 'onChange',
    defaultValues: {
      gameServerId: selectedGameServerId,
    },
  });

  useEffect(() => {
    const subscription = watch((value) => {
      console.log('watching', value);
      // a new gameserver was selected
      const params = matchRoute({
        to: '/gameserver/$gameServerId',
        fuzzy: true,
      }) as { gameServerId: string; '**': string } | false;

      if (params !== false) {
        navigate({
          to: `/gameserver/$gameServerId/${params['**']}`,
          params: {
            gameServerId: value.gameServerId,
          },
          startTransition: true,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch('gameServerId'), matchRoute]);

  return <GameServerSelect control={control} name="gameServerId" label="" />;
};
