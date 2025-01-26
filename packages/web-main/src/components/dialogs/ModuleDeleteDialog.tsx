import { Button, Dialog, FormError, ValueConfirmationField } from '@takaro/lib-components';
import { useModuleRemove } from 'queries/module';
import { forwardRef, MouseEvent, useImperativeHandle, useState } from 'react';
import { DeleteImperativeHandle, RequiredDialogOptions } from '.';

interface ModuleDeleteDialogProps extends RequiredDialogOptions {
  moduleName: string;
  moduleId: string;
}

export const ModuleDeleteDialog = forwardRef<DeleteImperativeHandle, ModuleDeleteDialogProps>(
  function ModuleDeleteDialog({ moduleName, moduleId, ...dialogOptions }, ref) {
    const [isValid, setIsValid] = useState<boolean>(false);
    const {
      mutate: removeModule,
      isPending: isDeleting,
      isSuccess: deleteIsSuccess,
      error: deleteError,
    } = useModuleRemove();

    useImperativeHandle(ref, () => ({
      triggerDelete: () => removeModule({ moduleId }),
    }));

    if (deleteIsSuccess) {
      dialogOptions.onOpenChange(false);
    }

    const handleOnDelete = (e: MouseEvent) => {
      e.stopPropagation();
      removeModule({ moduleId });
    };

    return (
      <Dialog {...dialogOptions}>
        <Dialog.Content>
          <Dialog.Heading size={4}>
            Delete Module: <span style={{ textTransform: 'capitalize' }}>{moduleName}</span>{' '}
          </Dialog.Heading>
          <Dialog.Body>
            <p>
              Are you sure you want to delete the module <strong>{moduleName}</strong>? To confirm, type the module name
              below.
            </p>
            <ValueConfirmationField
              id="deleteModuleConfirmation"
              onValidChange={(valid) => setIsValid(valid)}
              value={moduleName}
              label="Module name"
            />
            <Button
              isLoading={isDeleting}
              onClick={handleOnDelete}
              fullWidth
              disabled={!isValid}
              text="Delete module"
              color="error"
            />
            {deleteError && <FormError error={deleteError} />}
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    );
  },
);
