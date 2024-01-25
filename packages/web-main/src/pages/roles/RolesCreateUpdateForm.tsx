import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, CollapseList, Drawer, FormError, Switch, TextField } from '@takaro/lib-components';
import { PermissionOutputDTO, RoleOutputDTO } from '@takaro/apiclient';
import { useForm, SubmitHandler } from 'react-hook-form';
import { PATHS } from 'paths';
import { zodResolver } from '@hookform/resolvers/zod';
import { validationSchema } from './validationSchema';
import { ButtonContainer, PermissionContainer } from './style';

interface CreateUpdateRoleFormProps {
  initialData?: RoleOutputDTO;
  permissions: PermissionOutputDTO[];
  isLoading: boolean;
  onSubmit: SubmitHandler<IFormInputs>;
}

export interface IFormInputs {
  name: string;
  permissions: Record<string, { enabled: boolean; count?: number }>;
}

export const CreateUpdateRoleForm: FC<CreateUpdateRoleFormProps> = ({
  initialData,
  permissions,
  isLoading,
  onSubmit,
}) => {
  const [open, setOpen] = useState(true);
  const [error] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      navigate(PATHS.roles.overview());
    }
  }, [open, navigate]);

  const { control, handleSubmit } = useForm<IFormInputs>({
    mode: 'onChange',
    resolver: zodResolver(validationSchema),
    defaultValues: initialData && {
      name: initialData.name,
      permissions: Object.values(permissions).reduce(
        (acc, permission) => ({
          ...acc,
          [permission.id]: {
            enabled: initialData.permissions.some((p) => p.permissionId === permission.id),
            count: initialData.permissions.find((p) => p.permissionId === permission.id)?.count,
          },
        }),
        {}
      ),
    },
  });

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
                    <PermissionContainer hasCount={permission.canHaveCount ? true : false}>
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
                    </PermissionContainer>
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
