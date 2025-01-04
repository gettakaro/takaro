import { FC, useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  styled,
  Button,
  Card,
  CollapseList,
  Drawer,
  FormError,
  Switch,
  TextField,
  useTheme,
  Chip,
  Tooltip,
} from '@takaro/lib-components';
import { PermissionOutputDTO, RoleOutputDTO } from '@takaro/apiclient';
import { useForm, SubmitHandler, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const PermissionContainer = styled.div<{ hasCount: boolean }>`
  ${({ hasCount, theme }) => hasCount && `border: 1px solid ${theme.colors.backgroundAccent}`};
  padding: ${({ theme }) => ` ${theme.spacing[1]} ${theme.spacing[1]} ${theme.spacing[0]} ${theme.spacing[1]}`};
  border-r
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
    }),
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
    if (permission.moduleVersionId) {
      const versionId = permission.moduleVersionId;
      if (!acc[versionId]) {
        acc[versionId] = {
          module: permission.module,
          moduleVersion: permission.version!,
          permissions: [],
        };
      }
      acc[versionId].permissions.push(permission);
    }
    return acc;
  }, {});

  useEffect(() => {
    if (!open) {
      navigate({ to: '/roles' });
    }
  }, [open]);

  const { control, handleSubmit, formState } = useForm<IFormInputs>({
    mode: 'onChange',
    resolver: zodResolver(validationSchema),
    values: initialData && {
      name: initialData.name,
      permissions: Object.values(permissions).reduce(
        (acc, permission) => ({
          ...acc,
          [permission.id]: {
            enabled: initialData.permissions.some((p) => p.permissionId === permission.id),
            count: initialData.permissions.find((p) => p.permissionId === permission.id)?.count,
          },
        }),
        {},
      ),
    },
  });

  const multipleVersionsOfSameModuleInstalled = (groupedModulePermissions: any, currentKey: any): boolean => {
    const withoutCurrentKey = Object.keys(groupedModulePermissions).filter((key) => key != currentKey);
    return withoutCurrentKey.some(
      (key) => groupedModulePermissions[key].module.id == groupedModulePermissions[currentKey].module.id,
    );
  };

  return (
    <Drawer open={open} onOpenChange={setOpen} promptCloseConfirmation={formState.isDirty}>
      <Drawer.Content>
        <Drawer.Heading>{initialData ? (readOnly ? 'View' : 'Update') : 'Create'} role</Drawer.Heading>
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
                {Object.keys(groupedModulePermissions).map((key: any) => (
                  <Card
                    key={groupedModulePermissions[key].module.id}
                    variant="outline"
                    style={{ marginBottom: theme.spacing['2'] }}
                  >
                    <Card.Body>
                      <h3
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: theme.spacing['1'],
                          textTransform: 'capitalize',
                        }}
                      >
                        <span>{groupedModulePermissions[key].module.name}</span>
                        <div style={{ display: 'flex' }}>
                          <Tooltip disabled={!multipleVersionsOfSameModuleInstalled(groupedModulePermissions, key)}>
                            <Tooltip.Trigger>
                              <Chip
                                variant="outline"
                                color={
                                  multipleVersionsOfSameModuleInstalled(groupedModulePermissions, key)
                                    ? 'warning'
                                    : 'primary'
                                }
                                label={`${groupedModulePermissions[key].moduleVersion.tag}`}
                              />
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                              Multiple versions of this module are be installed on your gameservers. Meaning
                              <br />
                              permission with the same name can exist. Make sure you are assigning the correct
                              <br />
                              permission to the role.
                            </Tooltip.Content>
                          </Tooltip>
                        </div>
                      </h3>
                      {}
                      {groupedModulePermissions[key].permissions.map((permission: any) => (
                        <PermissionField
                          key={permission.id}
                          permission={permission}
                          control={control}
                          readOnly={readOnly}
                        />
                      ))}
                    </Card.Body>
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
              <Button
                fullWidth
                text={initialData ? 'Update role' : 'Create role'}
                type="submit"
                form="create-role-form"
              />
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
