import { FC } from 'react';
import { IFormInputs } from '..';
import { PermissionCard, Title, Fields } from './style';
import { Control, UseFieldArrayRemove, useWatch } from 'react-hook-form';
import { Tooltip, IconButton, TextField, Chip } from '@takaro/lib-components';
import { AiOutlineDelete as RemoveIcon } from 'react-icons/ai';

export interface PermissionFieldProps {
  control: Control<IFormInputs>;
  id: string;
  index: number;
  remove: UseFieldArrayRemove;
}

export const PermissionField: FC<PermissionFieldProps> = ({ index, id, remove, control }) => {
  const permissionName = useWatch({ control, name: `permissions.${index}.permission` });
  return (
    <PermissionCard key={id} data-testid={`permission-${index}`}>
      <Title>
        <div className="inner">
          <Chip color="primary" label={`Permission ${index + 1}`} />
          <h3>{permissionName}</h3>
        </div>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <IconButton
              onClick={() => remove(index)}
              icon={<RemoveIcon size={16} cursor="pointer" />}
              ariaLabel="Remove permission"
            />
          </Tooltip.Trigger>
          <Tooltip.Content>Remove</Tooltip.Content>
        </Tooltip>
      </Title>
      <Fields>
        <TextField
          label="Name"
          control={control}
          name={`permissions.${index}.permission`}
          description="This is the permission code name, what you will need to check for inside the module code"
          required
        />
        <TextField
          control={control}
          label="Description"
          name={`permissions.${index}.description`}
          placeholder=""
          required
        />
        <TextField
          control={control}
          label="Friendly name"
          name={`permissions.${index}.friendlyName`}
          description="This is the name that will be shown when editing permissions of a role"
          required
        />
      </Fields>
    </PermissionCard>
  );
};
