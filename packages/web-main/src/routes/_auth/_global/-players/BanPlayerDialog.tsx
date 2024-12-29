import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBanPlayer } from 'queries/player';
import { FC } from 'react';
import { Button, DatePicker, Dialog, FormError, TextAreaField } from '@takaro/lib-components';
import { GameServerSelectQueryField } from 'components/selects';
import { DateTime } from 'luxon';

const validationSchema = z.object({
  reason: z.string().min(1).max(100),
  gameServerId: z.string().optional(),
  expiresAt: z.string().optional(),
});

interface BanPlayerDialogProps {
  openDialog: boolean;
  setOpenDialog: (value: boolean) => void;
  player: { name: string; id: string };
}

export const BanPlayerDialog: FC<BanPlayerDialogProps> = ({ openDialog, setOpenDialog, player }) => {
  const { handleSubmit, control } = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
  });

  const { mutate: mutateBanPlayer, isPending: isLoadingBanPlayer, error: banError, isSuccess } = useBanPlayer();

  if (isSuccess) {
    setOpenDialog(false);
  }

  const handleOnBanPlayer: SubmitHandler<z.infer<typeof validationSchema>> = async ({
    reason,
    gameServerId,
    expiresAt,
  }) => {
    // If no gameServerId is provided, the ban is considered global. But isGlobal always needs to be set explicitly.
    // No ghosts in the code!
    const isGlobal = !!gameServerId;
    mutateBanPlayer({ playerId: player.id, reason, gameServerId, isGlobal, until: expiresAt });
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <Dialog.Content>
        <Dialog.Heading>ban player: {player.name}</Dialog.Heading>
        <Dialog.Body size="medium">
          <form onSubmit={handleSubmit(handleOnBanPlayer)}>
            <GameServerSelectQueryField
              loading={isLoadingBanPlayer}
              name="gameServerId"
              control={control}
              required={false}
            />
            <TextAreaField
              control={control}
              loading={isLoadingBanPlayer}
              name="reason"
              label="Ban Reason"
              placeholder="Cheating, Racism, etc."
              required={true}
            />
            <DatePicker
              name="expiresAt"
              mode="absolute"
              control={control}
              required={false}
              label={'Expiration date'}
              loading={isLoadingBanPlayer}
              description={'The role will be automatically removed after this date.'}
              popOverPlacement={'bottom'}
              timePickerOptions={{ interval: 30 }}
              allowPastDates={false}
              format={DateTime.DATETIME_SHORT}
            />
            <Button isLoading={isLoadingBanPlayer} type="submit" fullWidth text={'Ban player'} color="error" />
          </form>
          {banError && <FormError error={banError} />}
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};