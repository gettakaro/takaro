import { Button, Dialog, FormError, ValueConfirmationField } from '@takaro/lib-components';
import { DeleteImperativeHandle, RequiredDialogOptions } from '.';
import { forwardRef, MouseEvent, useImperativeHandle, useState } from 'react';
import { useRoleRemove } from 'queries/role';

interface RoleDeleteDialogProps extends RequiredDialogOptions {
  roleId: string;
  roleName: string;
}

export const RoleDeleteDialog = forwardRef<DeleteImperativeHandle, RoleDeleteDialogProps>(
  ({ roleId, roleName, ...dialogOptions }, ref) => {
    const [valid, setValid] = useState<boolean>(false);
    const { mutate, isPending: isDeleting, isSuccess, error } = useRoleRemove();

    useImperativeHandle(ref, () => ({
      triggerDelete: () => mutate({ roleId }),
    }));

    const handleOnDelete = (e: MouseEvent) => {
      e.stopPropagation();
      mutate({ roleId });
    };

    if (isSuccess) {
      dialogOptions.onOpenChange(false);
    }

    return (
      <Dialog {...dialogOptions}>
        <Dialog.Content>
          <Dialog.Heading>Delete role</Dialog.Heading>
          <Dialog.Body size="medium">
            <p>
              Are you sure you want to delete the role? To confirm, type <strong>{roleName}</strong>.
            </p>
            <ValueConfirmationField
              value={roleName}
              onValidChange={(v) => setValid(v)}
              label="Role name"
              id="deleteRoleConfirmation"
            />
            <Button
              isLoading={isDeleting}
              onClick={handleOnDelete}
              disabled={!valid}
              fullWidth
              text="Delete role"
              color="error"
            />
            {error && <FormError error={error} />}
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    );
  },
);
