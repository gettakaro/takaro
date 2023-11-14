import { Drawer, CollapseList, FormError, Button, Select, TextField, Loading } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { useRoles, useUserRoleUnassign } from 'queries/roles';
import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ButtonContainer } from './style';
import { zodResolver } from '@hookform/resolvers/zod';
import { userRoleAssignValidationschema } from './validationSchema';
import { SubmitHandler, useForm } from 'react-hook-form';
import { RoleOutputDTO } from '@takaro/apiclient';
import { useUserAssignRole, useUser } from 'queries/users';

interface IFormInputs {
  id: string;
  roleIds: string[];
}

interface IAssignRoleFormProps {
  roles: RoleOutputDTO[];
  assignedRoles: RoleOutputDTO[];
}

export const AssignUserRole: FC = () => {
  const { data: roles, isLoading: isLoadingRoles } = useRoles();
  const { userId } = useParams();
  const { data: user, isLoading: isLoadingUser } = useUser(userId!);

  if (isLoadingRoles || isLoadingUser || !roles) {
    return <Loading />;
  }

  const roleOptions = roles.pages.flatMap((page) => page.data);

  return <AssignUserRoleForm roles={roleOptions} assignedRoles={user?.roles ?? []} />;
};

const AssignUserRoleForm: FC<IAssignRoleFormProps> = ({ roles, assignedRoles }) => {
  const [open, setOpen] = useState(true);
  const { mutateAsync: assignRoleMutate, isLoading: isLoadingAssign, error: assignError } = useUserAssignRole();
  const { mutateAsync: unAssignRoleMutate, isLoading: isLoadingUnAssign, error: unAssignError } = useUserRoleUnassign();

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

  // TODO: should have the already assigned roles selected?
  const { control, handleSubmit } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(userRoleAssignValidationschema),
    defaultValues: {
      id: userId,
      roleIds: assignedRoles.map((role) => role.id),
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({ id, roleIds }) => {
    const newAssignments = roleIds
      .filter((roleId) => !assignedRoles.some((role) => role.id === roleId))
      .map((roleId) => assignRoleMutate({ userId: id, roleId }));
    // roles that are no longer assigned, meaning they should be in assignedRoles but not in roleIds
    const removedRoles = assignedRoles
      .filter((role) => !roleIds.some((roleId) => roleId === role.id))
      .map((role) => unAssignRoleMutate({ id, roleId: role.id }));

    await Promise.all([...newAssignments, ...removedRoles]);
    navigate(PATHS.user.profile(id));
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>Assign roles</Drawer.Heading>
        <Drawer.Body>
          <CollapseList>
            <form onSubmit={handleSubmit(onSubmit)} id="assign-user-role-form">
              <CollapseList.Item title="General">
                <TextField readOnly control={control} name="id" label="User" />

                <Select
                  control={control}
                  multiSelect
                  name="roleIds"
                  label="Roles"
                  inPortal
                  enableFilter
                  render={(selectedIndices) => (
                    <div>
                      {selectedIndices.length === 0
                        ? 'Select...'
                        : selectedIndices.length <= 3
                        ? selectedIndices.map((index) => roles[index]?.name).join(', ')
                        : `${selectedIndices
                            .slice(0, 3)
                            .map((index) => roles[index]?.name)
                            .join(', ')} and ${selectedIndices.length - 3} more`}
                    </div>
                  )}
                >
                  <Select.OptionGroup label="Roles">
                    {roles.map((role) => (
                      <Select.Option key={role.id} value={role.id} label={role.name}>
                        {role.name}
                      </Select.Option>
                    ))}
                  </Select.OptionGroup>
                </Select>
              </CollapseList.Item>
              {assignError && <FormError error={assignError} />}
              {unAssignError && <FormError error={unAssignError} />}
            </form>
          </CollapseList>
        </Drawer.Body>
        <Drawer.Footer>
          <ButtonContainer>
            <Button text="Cancel" onClick={() => setOpen(false)} color="background" />
            <Button
              fullWidth
              text="Save changes"
              isLoading={isLoadingAssign || isLoadingUnAssign}
              type="submit"
              form="assign-user-role-form"
            />
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
