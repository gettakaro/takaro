import { FC, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, TextField, Drawer, CollapseList, FormError, Switch } from '@takaro/lib-components';
import { ButtonContainer } from './style';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import * as Sentry from '@sentry/react';
import { useRoleCreate } from 'queries/roles';
import { RoleCreateInputDTOPermissionsEnum } from '@takaro/apiclient';
import { validationSchema } from './validationSchema';

interface IFormInputs {
  name: string;
  permissions: Record<string, boolean>;
}

export const RolesCreate: FC = () => {
  const [open, setOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      permissions: Object.keys(RoleCreateInputDTOPermissionsEnum).reduce(
        (acc, permission) => ({ ...acc, [permission]: false }),
        {}
      ),
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({ name, permissions }) => {
    try {
      const activePermissions = Object.entries(permissions)
        .filter(([_key, value]) => value === true)
        .map(
          ([key, _value]) => RoleCreateInputDTOPermissionsEnum[key as keyof typeof RoleCreateInputDTOPermissionsEnum]
        );

      await mutateAsync({
        name,
        permissions: activePermissions,
      });

      navigate(PATHS.roles.overview());
    } catch (error) {
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
                {Object.keys(RoleCreateInputDTOPermissionsEnum).map((permission) => (
                  <Switch
                    control={control}
                    label={permission.replace(/([A-Z])/g, ' $1').trim()}
                    name={`permissions.${permission}`}
                    key={permission}
                  />
                ))}
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
