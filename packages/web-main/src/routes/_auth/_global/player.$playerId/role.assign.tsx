import { Drawer, FormError, Button, TextField, DatePicker, DrawerSkeleton, styled } from '@takaro/lib-components';
import { usePlayerRoleAssign } from 'queries/player';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { DateTime, Settings } from 'luxon';
import { GameServerSelectQueryField, RoleSelectQueryField } from 'components/selects';
import { z } from 'zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

Settings.throwOnInvalid = true;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const roleAssignValidationSchema = z.object({
  playerId: z.string().uuid(),
  roleId: z.string().uuid(),
  gameServerId: z.string().optional(),
  expiresAt: z.string().optional(),
});
type IFormInputs = z.infer<typeof roleAssignValidationSchema>;

export const Route = createFileRoute('/_auth/_global/player/$playerId/role/assign')({
  component: Component,
  pendingComponent: DrawerSkeleton,
});

function Component() {
  const [open, setOpen] = useState(true);
  const { mutateAsync, isPending, error } = usePlayerRoleAssign();
  const navigate = useNavigate();
  const { playerId } = Route.useParams();

  useEffect(() => {
    if (!open) {
      navigate({ to: '/player/$playerId/info', params: { playerId } });
    }
  }, [open, navigate]);

  const { control, handleSubmit, formState } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(roleAssignValidationSchema),
    defaultValues: {
      playerId,
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({ playerId, roleId, gameServerId, expiresAt }) => {
    if (gameServerId === 'null') gameServerId = undefined;
    await mutateAsync({ playerId, roleId, gameServerId, expiresAt });
    navigate({ to: '/player/$playerId/info', params: { playerId } });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen} promptCloseConfirmation={formState.isDirty}>
      <Drawer.Content>
        <Drawer.Heading>Assign role</Drawer.Heading>
        <Drawer.Body>
          <form onSubmit={handleSubmit(onSubmit)} id="assign-player-role-form">
            <TextField readOnly control={control} name="playerId" label="Player" />
            <RoleSelectQueryField control={control} name="roleId" />
            <GameServerSelectQueryField
              addGlobalGameServerOption={true}
              canClear={true}
              control={control}
              name="gameServerId"
              label="Gameserver"
            />
            <DatePicker
              mode="absolute"
              control={control}
              label="Expiration date"
              name="expiresAt"
              required={false}
              loading={isPending}
              description="The role will be automatically removed after this date."
              popOverPlacement="bottom"
              allowPastDates={false}
              timePickerOptions={{ interval: 30 }}
              format={DateTime.DATETIME_SHORT}
            />
            {error && <FormError error={error} />}
          </form>
        </Drawer.Body>
        <Drawer.Footer>
          <ButtonContainer>
            <Button text="Cancel" onClick={() => setOpen(false)} color="background" />
            <Button fullWidth text="Assign role" isLoading={isPending} type="submit" form="assign-player-role-form" />
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}
