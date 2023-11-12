import { FC, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, TextField, Drawer, CollapseList, FormError, Switch, Loading } from '@takaro/lib-components';
import { ButtonContainer } from './style';
import { zodResolver } from '@hookform/resolvers/zod';
import { PermissionOutputDTO, RoleOutputDTO } from '@takaro/apiclient';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import { useParams } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { usePermissions, useRole, useRoleUpdate } from 'queries/roles/queries';
import { validationSchema } from './validationSchema';

export const RolesUpdate = () => {
  const { roleId } = useParams();
  const { data, isLoading } = useRole(roleId!);
  const { data: permissions, isLoading: isLoadingPermissions } = usePermissions();

  if (isLoading) {
    return <>isLoading</>;
  }

  if (isLoadingPermissions || !permissions) return <Loading />;

  if (!data || !roleId) {
    return <>something went wrong</>;
  }

  return <UpdateRoleForm data={data} roleId={roleId} permissions={permissions} />;
};

interface UpdateRoleformProps {
  data: RoleOutputDTO;
  roleId: string;
  permissions: PermissionOutputDTO[];
}

interface IFormInputs {
  name: string;
  permissions: Record<string, { enabled: boolean; count?: number }>;
}

const UpdateRoleForm: FC<UpdateRoleformProps> = ({ data, roleId, permissions }) => {
  const [open, setOpen] = useState(true);
  const [error] = useState<string | null>(null);
  const navigate = useNavigate();
  const { mutateAsync, isLoading } = useRoleUpdate();

  useEffect(() => {
    if (!open) {
      navigate(PATHS.roles.overview());
    }
  }, [open, navigate]);

  const { control, handleSubmit } = useForm<IFormInputs>({
    mode: 'onChange',
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: data.name,
      permissions: Object.values(permissions).reduce(
        (acc, permission) => ({
          ...acc,
          [permission.id]: {
            enabled: data.permissions.some((p) => p.permissionId === permission.id),
            count: data.permissions.find((p) => p.permissionId === permission.id)?.count,
          },
        }),
        {}
      ),
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({ name, permissions: formPermissions }) => {
    const activePermissions = Object.entries(formPermissions)
      .filter(([_key, value]) => value.enabled === true)
      .map(([key, value]) => ({
        permissionId: key,
        count: value.count,
      }));
    try {
      await mutateAsync({
        roleId,
        roleDetails: {
          name,
          permissions: activePermissions,
        },
      });
      navigate(PATHS.roles.overview());
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>Edit Role</Drawer.Heading>
        <Drawer.Body>
          <CollapseList>
            <form onSubmit={handleSubmit(onSubmit)} id="update-role-form">
              <CollapseList.Item title="General">
                <TextField
                  control={control}
                  label="Role name"
                  loading={isLoading}
                  name="name"
                  placeholder="My cool role"
                  required
                />
              </CollapseList.Item>
              <CollapseList.Item title="Permissions">
                {permissions.map((permission) => {
                  return (
                    <>
                      <Switch
                        control={control}
                        label={permission.friendlyName}
                        name={`permissions.${permission.id}.enabled`}
                        key={permission.id}
                        description={permission.description}
                      />
                      {permission.canHaveCount && (
                        <TextField
                          control={control}
                          label="Amount"
                          type="number"
                          placeholder="Enter amount"
                          name={`permissions.${permission.id}.count`}
                        />
                      )}
                    </>
                  );
                })}
              </CollapseList.Item>
            </form>
          </CollapseList>
          {error && <FormError message={error} />}
        </Drawer.Body>
        <Drawer.Footer>
          <ButtonContainer>
            <Button text="Cancel" onClick={() => setOpen(false)} color="background" type="button" />
            <Button fullWidth text="Save changes" type="submit" form="update-role-form" />
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
