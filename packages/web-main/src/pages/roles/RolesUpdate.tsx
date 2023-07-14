import { FC, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, TextField, Drawer, CollapseList, FormError, Switch } from '@takaro/lib-components';
import { ButtonContainer } from './style';
import { zodResolver } from '@hookform/resolvers/zod';
import { RoleOutputDTO, RoleUpdateInputDTOPermissionsEnum } from '@takaro/apiclient';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import { useParams } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { useRole, useRoleUpdate } from 'queries/roles/queries';
import { validationSchema } from './validationSchema';

export const RolesUpdate = () => {
  const { roleId } = useParams();
  const { data, isLoading } = useRole(roleId!);

  if (isLoading) {
    return <>isLoading</>;
  }

  if (!data || !roleId) {
    return <>something went wrong</>;
  }

  return <UpdateRoleForm data={data} roleId={roleId} />;
};

interface UpdateRoleformProps {
  data: RoleOutputDTO;
  roleId: string;
}

interface IFormInputs {
  name: string;
  permissions: Record<string, boolean>;
}

const UpdateRoleForm: FC<UpdateRoleformProps> = ({ data, roleId }) => {
  const [open, setOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { mutateAsync, isLoading } = useRoleUpdate();

  console.log(data.permissions);
  useEffect(() => {
    if (!open) {
      navigate(PATHS.roles.overview());
    }
  }, [open, navigate]);

  console.log();

  const { control, handleSubmit } = useForm<IFormInputs>({
    mode: 'onChange',
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: data.name,
      permissions: Object.keys(RoleUpdateInputDTOPermissionsEnum).reduce(
        (acc, permission) => ({
          ...acc,
          [permission]: data.permissions.some(
            ({ permission: p }) => p === RoleUpdateInputDTOPermissionsEnum[permission]
          ),
        }),
        {}
      ),
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({ name, permissions }) => {
    const activePermissions = Object.entries(permissions)
      .filter(([_key, value]) => value === true)
      .map(([key, _value]) => RoleUpdateInputDTOPermissionsEnum[key as keyof typeof RoleUpdateInputDTOPermissionsEnum]);
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
        <Drawer.Heading>Edit Game Server</Drawer.Heading>
        <Drawer.Body>
          <CollapseList>
            <form onSubmit={handleSubmit(onSubmit)} id="update-role-form">
              <CollapseList.Item title="General">
                <TextField
                  control={control}
                  label="Server name"
                  loading={isLoading}
                  name="name"
                  placeholder="My cool server"
                  required
                />
              </CollapseList.Item>
              <CollapseList.Item title="Permissions">
                {Object.keys(RoleUpdateInputDTOPermissionsEnum).map((permission) => (
                  <Switch
                    control={control}
                    label={permission.replace(/([A-Z])/g, ' $1').trim()}
                    name={`permissions.${permission}`}
                    key={permission}
                  />
                ))}
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
