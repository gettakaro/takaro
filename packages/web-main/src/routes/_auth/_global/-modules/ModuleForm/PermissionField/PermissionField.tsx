import { FC } from 'react';
import { Control, UseFieldArrayRemove, useWatch } from 'react-hook-form';
import { Tooltip, IconButton, TextField, Chip, Switch } from '@takaro/lib-components';
import { AiOutlineDelete as RemoveIcon } from 'react-icons/ai';

import { styled } from '@takaro/lib-components';

const PermissionCard = styled.li`
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const Title = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing['0_5']};

  .inner {
    display: flex;
    gap: ${({ theme }) => theme.spacing['0_5']};
  }
`;

const Fields = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

export interface PermissionFieldProps {
  control: Control<any>;
  id: string;
  index: number;
  remove: UseFieldArrayRemove;
  readOnly: boolean;
}

export const PermissionField: FC<PermissionFieldProps> = ({ index, id, remove, control, readOnly }) => {
  const permissionName = useWatch({ control, name: `permissions.${index}.permission` });
  return (
    <PermissionCard key={id} data-testid={`permission-${index}`}>
      <Title>
        <div className="inner">
          <Chip color="primary" label={`Permission ${index + 1}`} />
          <h3>{permissionName}</h3>
        </div>
        {!readOnly && (
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
        )}
      </Title>
      <Fields>
        <TextField
          label="Name"
          control={control}
          name={`permissions.${index}.permission`}
          description="This is the permission code name, what you will use inside the module code."
          required
          readOnly={readOnly}
        />
        <TextField
          control={control}
          label="Friendly name"
          name={`permissions.${index}.friendlyName`}
          description="This is the name that will be shown when editing permissions of a role."
          required
          readOnly={readOnly}
        />
        <TextField
          control={control}
          label="Description"
          name={`permissions.${index}.description`}
          placeholder=""
          required
          readOnly={readOnly}
        />
        <Switch
          control={control}
          name={`permissions.${index}.canHaveCount`}
          label="Can have count"
          description="Each permission can be associated with an abstract numerical value, serving various purposes. E.g. TELEPORTS_USE uses a count to restrict the number of teleport location a player can have.
          Enabling this option associates a count with the permission."
          readOnly={readOnly}
        />
      </Fields>
    </PermissionCard>
  );
};
