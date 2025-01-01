import { Button, Dialog, FormError, ValueConfirmationField } from '@takaro/lib-components';
import { useGameServerModuleUninstall } from 'queries/gameserver';
import { forwardRef, MouseEvent, useImperativeHandle, useState } from 'react';
import { DeleteImperativeHandle, RequiredDialogOptions } from '.';
import { useSnackbar } from 'notistack';

interface ModuleUninstallDialogProps extends RequiredDialogOptions {
  moduleName: string;
  gameServerId: string;
  versionId: string;
}

export const ModuleUninstallDialog = forwardRef<DeleteImperativeHandle, ModuleUninstallDialogProps>(
  ({ gameServerId, versionId, moduleName, ...dialogOptions }, ref) => {
    const { mutate, isPending: isDeleting, isSuccess, error } = useGameServerModuleUninstall();
    const [valid, setValid] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();

    useImperativeHandle(ref, () => ({
      triggerDelete: () => mutate({ gameServerId, versionId }),
    }));

    const handleUninstall = async (e: MouseEvent) => {
      e.stopPropagation();
      mutate({ gameServerId, versionId });
    };

    if (isSuccess) {
      enqueueSnackbar('Module uninstalled!', { variant: 'default', type: 'success' });
    }

    return (
      <Dialog {...dialogOptions}>
        <Dialog.Content>
          <Dialog.Heading>Module uninstall</Dialog.Heading>
          <Dialog.Body>
            <p style={{ alignContent: 'center' }}>
              Are you sure you want to uninstall the module <strong>{moduleName}</strong>? The module configuration will
              be lost. To confirm, type the module name below.
            </p>
            <ValueConfirmationField
              id="uninstallModuleConfirmation"
              onValidChange={(valid) => setValid(valid)}
              value={moduleName}
              label="Module name"
            />
            <Button
              isLoading={isDeleting}
              onClick={handleUninstall}
              fullWidth
              disabled={!valid}
              text="Uninstall module"
              color="error"
            />
            {error && <FormError error={error} />}
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    );
  },
);
