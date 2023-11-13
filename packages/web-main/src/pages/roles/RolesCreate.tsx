import { FC, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, TextField, Drawer, CollapseList, FormError, Switch, Loading } from '@takaro/lib-components';
import { ButtonContainer } from './style';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import * as Sentry from '@sentry/react';
import { usePermissions, useRoleCreate } from 'queries/roles';
import { validationSchema } from './validationSchema';
import { PermissionOutputDTO } from '@takaro/apiclient';

export const RolesCreate = () => {
  const { data: permissions, isLoading: isLoadingPermissions } = usePermissions();

  if (isLoadingPermissions || !permissions) return <Loading />;

  return <RolesCreateForm permissions={permissions} />;
};

interface CreateRoleformProps {
  permissions: PermissionOutputDTO[];
}
interface IFormInputs {
  name: string;
  permissions: Record<string, { enabled: boolean; count?: number }>;
}

export const RolesCreateForm: FC<CreateRoleformProps> = ({ permissions }) => {
  const [open, setOpen] = useState(true);
  const [error] = useState<string | null>(null);
  const navigate = useNavigate();
  const { mutateAsync, isLoading } = useRoleCreate();

  useEffect(() => {
    if (!open) {
      navigate(PATHS.roles.overview());
    }
  }, [open, navigate]);

  const { control, handleSubmit } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: '',
      permissions: Object.values(permissions).reduce(
        (acc, permission) => ({
          ...acc,
          [permission.permission]: {
            enabled: false,
            count: 0,
          },
        }),
        {}
      ),
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({ name, permissions: formPermissions }) => {
    try {
      const activePermissions = Object.entries(formPermissions)
        .filter(([_key, value]) => value.enabled === true)
        .map(([key, value]) => ({
          permissionId: key,
          count: value.count,
        }));

      await mutateAsync({
        name,
        permissions: activePermissions,
      });

      navigate(PATHS.roles.overview());
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>Create role</Drawer.Heading>
        <Drawer.Body>
          <CollapseList>
            <form onSubmit={handleSubmit(onSubmit)} id="create-role-form">
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
              {error && <FormError message={error} />}
            </form>
          </CollapseList>
        </Drawer.Body>
        <Drawer.Footer>
          <ButtonContainer>
            <Button text="Cancel" onClick={() => setOpen(false)} color="background" />
            <Button fullWidth text="Save changes" type="submit" form="create-role-form" />
          </ButtonContainer>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
