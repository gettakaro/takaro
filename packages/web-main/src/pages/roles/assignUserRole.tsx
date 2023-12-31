import { Drawer, CollapseList, FormError, Button, TextField, Loading, DatePicker } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { useRoles } from 'queries/roles';
import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ButtonContainer } from './style';
import { zodResolver } from '@hookform/resolvers/zod';
import { roleAssignValidationSchema } from './validationSchema';
import { SubmitHandler, useForm } from 'react-hook-form';
import { RoleOutputDTO } from '@takaro/apiclient';
import { useUserAssignRole } from 'queries/users';
import { DateTime } from 'luxon';
import { RolesSelect } from 'components/selects';

interface IFormInputs {
  id: string;
  roleId: string;
  expiresAt?: string;
}

interface IAssignRoleFormProps {
  roles: RoleOutputDTO[];
}

export const AssignUserRole: FC = () => {
  const { data: roles, isLoading: isLoadingRoles } = useRoles();

  if (isLoadingRoles || !roles) {
    return <Loading />;
  }

  const roleOptions = roles.pages.flatMap((page) => page.data);

  return <AssignUserRoleForm roles={roleOptions} />;
};

const AssignUserRoleForm: FC<IAssignRoleFormProps> = ({ roles }) => {
  const [open, setOpen] = useState(true);
  const { mutateAsync, isLoading, error } = useUserAssignRole();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  useEffect(() => {
    if (!userId) {
      navigate(PATHS.users());
      return;
    }

    if (!open) {
      navigate(PATHS.user.profile(userId));
    }
  }, [open, navigate]);

  const { control, handleSubmit } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(roleAssignValidationSchema),
    defaultValues: {
      id: userId,
      roleId: roles[0].id,
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({ id, roleId, expiresAt }) => {
    await mutateAsync({ userId: id, roleId, expiresAt });
    navigate(PATHS.user.profile(id));
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>Assign role</Drawer.Heading>
        <Drawer.Body>
          <CollapseList>
            <form onSubmit={handleSubmit(onSubmit)} id="assign-user-role-form">
              <CollapseList.Item title="General">
                <TextField readOnly control={control} name="id" label="User" />
                <RolesSelect control={control} name="roleId" label="Role" />
                <DatePicker
                  mode="absolute"
                  control={control}
                  label={'Expiration date'}
                  name={'expiresAt'}
                  required={false}
                  loading={isLoading}
                  description={'The role will be automatically removed after this date'}
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
            <Button fullWidth text="Save changes" isLoading={isLoading} type="submit" form="assign-user-role-form" />
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
