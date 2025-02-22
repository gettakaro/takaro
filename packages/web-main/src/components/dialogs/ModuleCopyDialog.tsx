import { Dialog } from '@takaro/lib-components';
import { useSnackbar } from 'notistack';
import { FC } from 'react';
import { CopyModuleForm } from '../../components/CopyModuleForm';
import { ModuleOutputDTO } from '@takaro/apiclient';
import { RequiredDialogOptions } from '.';
interface ModuleCopyDialogProps extends RequiredDialogOptions {
  mod: ModuleOutputDTO;
}

export const ModuleCopyDialog: FC<ModuleCopyDialogProps> = ({ mod, ...dialogOptions }) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleOnCopySuccess = async () => {
    enqueueSnackbar('Module successfully copied.', { variant: 'default', type: 'success' });
    dialogOptions.onOpenChange(false);
  };

  return (
    <Dialog {...dialogOptions}>
      <Dialog.Content>
        <Dialog.Heading size={4}>
          Module: <span style={{ textTransform: 'capitalize' }}>{mod.name}</span>
        </Dialog.Heading>
        <Dialog.Body>
          <h2 style={{ marginBottom: '15px', minWidth: '300px' }}>
            Copy module: <strong>{mod.name}</strong>
          </h2>
          <CopyModuleForm mod={mod} onSuccess={handleOnCopySuccess} />
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
