import { Dialog } from '@takaro/lib-components';
import { useSnackbar } from 'notistack';
import { FC } from 'react';
import { CopyModuleForm } from 'components/CopyModuleForm';
import { ModuleOutputDTO } from '@takaro/apiclient';
import { RequiredDialogOptions } from '.';
interface ModuleCopyDialogProps extends RequiredDialogOptions {
  mod: ModuleOutputDTO;
}

export const ModuleCopyDialog: FC<ModuleCopyDialogProps> = ({ mod, ...dialogOptions }) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleOnCopySuccess = async (_moduleId: string) => {
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
          <h2>
            Copy module: <strong>{mod.name}</strong>
          </h2>
          <CopyModuleForm mod={mod} onSuccess={(e) => handleOnCopySuccess(e)} />
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
