import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormError } from '@takaro/lib-components';
import { GameServerSelectQueryField } from '../../../../components/selects';
import { useCronJobTrigger as useCronjobTrigger } from '../../../../queries/module';
import { FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

interface CronjobTriggerProps {
  cronjobId: string;
  moduleId: string;
}

const validationSchema = z.object({
  gameserverId: z.string().min(1),
});

export const CronjobTrigger: FC<CronjobTriggerProps> = ({ cronjobId, moduleId }) => {
  const { isPending, mutate, error } = useCronjobTrigger();
  const { control, handleSubmit } = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = ({ gameserverId }) => {
    mutate({
      cronjobId,
      gameServerId: gameserverId,
      moduleId,
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GameServerSelectQueryField
          loading={isPending}
          name="gameserverId"
          control={control}
          required
          description="Game server to trigger cronjob on. This field does not validate if the gameserver has the module installed."
        />
        <Button type="submit" fullWidth text="Trigger cronjob" isLoading={isPending} />
        <div style={{ marginBottom: '10px' }} />
        {error && <FormError error={error} />}
      </form>
    </div>
  );
};
