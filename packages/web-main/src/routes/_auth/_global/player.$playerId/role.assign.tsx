import {
  Drawer,
  CollapseList,
  FormError,
  Button,
  SelectField,
  TextField,
  DatePicker,
  DrawerSkeleton,
  styled,
} from '@takaro/lib-components';
import { rolesQueryOptions } from 'queries/role';
import { usePlayerRoleAssign } from 'queries/player';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { GameServerOutputDTO } from '@takaro/apiclient';
import { DateTime, Settings } from 'luxon';
import { RoleSelect } from 'components/selects';
import { z } from 'zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { gameServersQueryOptions } from 'queries/gameserver';

Settings.throwOnInvalid = true;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const roleAssignValidationSchema = z.object({
  id: z.string().uuid(),
  roleId: z.string().uuid(),
  gameServerId: z.string().optional(),
  expiresAt: z.string().optional(),
});
type IFormInputs = z.infer<typeof roleAssignValidationSchema>;

export const Route = createFileRoute('/_auth/_global/player/$playerId/role/assign')({
  loader: async ({ context }) => {
    const p1 = context.queryClient.ensureQueryData(rolesQueryOptions());
    const p2 = context.queryClient.ensureQueryData(gameServersQueryOptions());
    const [roles, gameservers] = await Promise.all([p1, p2]);
    const gameServerOptions = [
      { name: 'Global - applies to all gameservers', id: 'null' } as GameServerOutputDTO,
      ...gameservers,
    ];
    return { roles: roles.data, gameServers: gameServerOptions };
  },
  component: Component,
  pendingComponent: DrawerSkeleton,
});

function Component() {
  const [open, setOpen] = useState(true);
  const { mutateAsync, isPending, error } = usePlayerRoleAssign();
  const navigate = useNavigate();
  const { playerId } = Route.useParams();
  const { gameServers, roles } = Route.useLoaderData();

  useEffect(() => {
    if (!open) {
      navigate({ to: '/player/$playerId/info', params: { playerId } });
    }
  }, [open, navigate]);

  const { control, handleSubmit } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(roleAssignValidationSchema),
    defaultValues: {
      id: playerId,
      roleId: roles[0].id,
      gameServerId: gameServers[0].id,
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({ id, roleId, gameServerId, expiresAt }) => {
    if (gameServerId === 'null') gameServerId = undefined;
    await mutateAsync({ id, roleId, gameServerId, expiresAt });
    navigate({ to: '/player/$playerId/info', params: { playerId } });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>Assign role</Drawer.Heading>
        <Drawer.Body>
          <CollapseList>
            <form onSubmit={handleSubmit(onSubmit)} id="create-role-form">
              <CollapseList.Item title="General">
                <TextField readOnly control={control} name="id" label="Player" />
                <RoleSelect control={control} name="roleId" />
                <SelectField
                  canClear={true}
                  control={control}
                  name="gameServerId"
                  label="Gameserver"
                  render={(selectedItems) => {
                    if (selectedItems.length === 0) {
                      // in case nothing is selected, we default to global
                      return <div>Global - applies to all gameservers</div>;
                    }
                    return <div>{selectedItems[0].label}</div>;
                  }}
                >
                  <SelectField.OptionGroup label="gameservers">
                    {gameServers.map((server) => (
                      <SelectField.Option key={server.id} value={server.id} label={server.name}>
                        {server.name}
                      </SelectField.Option>
                    ))}
                  </SelectField.OptionGroup>
                </SelectField>

                <DatePicker
                  mode="absolute"
                  control={control}
                  label={'Expiration date'}
                  name={'expiresAt'}
                  required={false}
                  loading={isPending}
                  description={'The role will be automatically removed after this date'}
                  popOverPlacement={'bottom'}
                  allowPastDates={false}
                  timePickerOptions={{ interval: 30 }}
                  format={DateTime.DATETIME_SHORT}
                />
              </CollapseList.Item>
              {error && <FormError error={error} />}
            </form>
          </CollapseList>
        </Drawer.Body>
        <Drawer.Footer>
          <ButtonContainer>
            <Button text="Cancel" onClick={() => setOpen(false)} color="background" />
            <Button fullWidth text="Assign role" isLoading={isPending} type="submit" form="create-role-form" />
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}
