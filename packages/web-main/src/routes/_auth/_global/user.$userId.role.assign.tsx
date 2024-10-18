import {
  Drawer,
  CollapseList,
  FormError,
  Button,
  TextField,
  DatePicker,
  DrawerSkeleton,
  styled,
} from '@takaro/lib-components';
import { userMeQueryOptions, useUserAssignRole } from 'queries/user';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { DateTime, Settings } from 'luxon';
import { RoleSelectQueryField } from 'components/selects';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { z } from 'zod';
import { hasPermission } from 'hooks/useHasPermission';

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

export const Route = createFileRoute('/_auth/_global/user/$userId/role/assign')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['READ_ROLES', 'MANAGE_ROLES', 'READ_USERS', 'MANAGE_USERS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
  pendingComponent: () => <DrawerSkeleton />,
});

function Component() {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const { userId } = Route.useParams();
  const { mutate, isPending, error } = useUserAssignRole();

  useEffect(() => {
    if (!open) {
      router.history.go(-1);
    }
  }, [open]);

  const { control, handleSubmit, formState } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(roleAssignValidationSchema),
    defaultValues: {
      id: userId,
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = ({ id, roleId, expiresAt }) => {
    mutate({ userId: id, roleId, expiresAt });
  };

  return (
    <Drawer open={open} onOpenChange={setOpen} promptCloseConfirmation={formState.isDirty}>
      <Drawer.Content>
        <Drawer.Heading>Assign role</Drawer.Heading>
        <Drawer.Body>
          <CollapseList>
            <form onSubmit={handleSubmit(onSubmit)} id="assign-user-role-form">
              <CollapseList.Item title="General">
                <TextField readOnly control={control} name="id" label="User" />
                <RoleSelectQueryField control={control} name="roleId" label="Role" />
                <DatePicker
                  mode="absolute"
                  control={control}
                  label={'Expiration date'}
                  name={'expiresAt'}
                  required={false}
                  loading={isPending}
                  description={'The role will be automatically removed after this date.'}
                  popOverPlacement={'bottom'}
                  timePickerOptions={{ interval: 30 }}
                  allowPastDates={false}
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
            <Button fullWidth text="Assign role" isLoading={isPending} type="submit" form="assign-user-role-form" />
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}
