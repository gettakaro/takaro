import { FC, useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button, Card, CollapseList, Drawer, FormError, Switch, TextField, useTheme } from '@takaro/lib-components';
import { PermissionOutputDTO, RoleOutputDTO } from '@takaro/apiclient';
import { useForm, SubmitHandler, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { styled } from '@takaro/lib-components';

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const PermissionContainer = styled.div<{ hasCount: boolean }>`
  ${({ hasCount, theme }) => hasCount && `border: 1px solid ${theme.colors.backgroundAccent}`};
  padding: ${({ theme }) => ` ${theme.spacing[1]} ${theme.spacing[1]} ${theme.spacing[0]} ${theme.spacing[1]}`};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  margin-bottom: ${({ theme }) => theme.spacing[1]};

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const validationSchema = z.object({
  name: z.string().min(3).max(50),
  permissions: z.record(
    z.object({
      enabled: z.boolean().optional(),
      count: z.number().optional(),
    })
  ),
});
export type IFormInputs = z.infer<typeof validationSchema>;

interface CreateUpdateRoleFormProps {
  initialData?: RoleOutputDTO;
  permissions: PermissionOutputDTO[];
  isLoading?: boolean;
  onSubmit?: SubmitHandler<IFormInputs>;
  error: string | string[] | null;
}

export const RoleForm: FC<CreateUpdateRoleFormProps> = ({
  initialData,
  permissions,
  isLoading = false,
  onSubmit,
  error,
}) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const readOnly = onSubmit === undefined;

  const systemPermissions = permissions.filter((p) => !p.module);
  const groupedModulePermissions = permissions.reduce((acc, permission) => {
    if (permission.module) {
      const moduleId = permission.module.id;
      if (!acc[moduleId]) {
        acc[moduleId] = {
          module: permission.module,
          permissions: [],
        };
      }
      acc[moduleId].permissions.push(permission);
    }
    return acc;
  }, {});

  useEffect(() => {
    if (!open) {
      navigate({ to: '/roles' });
    }
  }, [open]);

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
            <form onSubmit={onSubmit && handleSubmit(onSubmit)} id="create-role-form">
              <CollapseList.Item title="General">
                <TextField
                  control={control}
                  label="Role name"
                  loading={isLoading}
                  name="name"
                  placeholder="My cool role"
                  readOnly={readOnly}
                  required
                />
              </CollapseList.Item>
              <CollapseList.Item title="System permissions">
                {systemPermissions.map((permission) => (
                  <PermissionField key={permission.id} permission={permission} control={control} readOnly={readOnly} />
                ))}
              </CollapseList.Item>
              <CollapseList.Item title="Module permissions">
                {Object.values(groupedModulePermissions).map((group: any) => (
                  <Card key={group.module.id} variant="outline" style={{ marginBottom: theme.spacing['2'] }}>
                    <h3 style={{ marginBottom: theme.spacing['1'], textTransform: 'capitalize' }}>
                      {group.module.name}
                    </h3>
                    {group.permissions.map((permission: any) => (
                      <PermissionField
                        key={permission.id}
                        permission={permission}
                        control={control}
                        readOnly={readOnly}
                      />
                    ))}
                  </Card>
                ))}{' '}
              </CollapseList.Item>
              {error && <FormError error={error} />}
            </form>
          </CollapseList>
        </Drawer.Body>
        <Drawer.Footer>
          {readOnly ? (
            <Button text="Close view" fullWidth onClick={() => setOpen(false)} color="primary" />
          ) : (
            <ButtonContainer>
              <Button text="Cancel" onClick={() => setOpen(false)} color="background" />
              <Button fullWidth text="Save changes" type="submit" form="create-role-form" />
            </ButtonContainer>
          )}
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};

interface PermissionFieldProps {
  permission: PermissionOutputDTO;
  control: Control<IFormInputs>;
  readOnly: boolean;
}

const PermissionField: FC<PermissionFieldProps> = ({ permission, control, readOnly }) => {
  return (
    <PermissionContainer hasCount={permission.canHaveCount ? true : false}>
      <Switch
        control={control}
        label={`${permission.friendlyName}`}
        name={`permissions.${permission.id}.enabled`}
        key={permission.id}
        description={permission.description}
        readOnly={readOnly}
      />
      {permission.canHaveCount && (
        <TextField
          control={control}
          label="Amount"
          type="number"
          readOnly={readOnly}
          placeholder="Enter amount"
          name={`permissions.${permission.id}.count`}
        />
      )}
    </PermissionContainer>
  );
};
