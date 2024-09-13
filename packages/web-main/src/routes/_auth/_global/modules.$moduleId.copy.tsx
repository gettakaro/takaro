import { Dialog } from '@takaro/lib-components';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';
import { moduleQueryOptions } from 'queries/module';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { CopyModuleForm } from 'components/CopyModuleForm';
import { userMeQueryOptions } from 'queries/user';

export const Route = createFileRoute('/_auth/_global/modules/$moduleId/copy')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['MANAGE_MODULES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ params, context }) => context.queryClient.ensureQueryData(moduleQueryOptions(params.moduleId)),
  component: Component,
});

function Component() {
  const { enqueueSnackbar } = useSnackbar();
  const [openCopyDialog, setOpenCopyDialog] = useState<boolean>(true);
  const mod = Route.useLoaderData();
  const { history } = useRouter();

  const handleOnCopySuccess = async (_moduleId: string) => {
    enqueueSnackbar('Module successfully copied.', { variant: 'default', type: 'success' });
    setOpenCopyDialog(false);
    history.go(-1);
  };

  return (
    <Dialog open={openCopyDialog} onOpenChange={setOpenCopyDialog}>
      <Dialog.Content>
        <Dialog.Heading size={4}>
          Module: <span style={{ textTransform: 'capitalize' }}>{mod.name}</span>
        </Dialog.Heading>
        <Dialog.Body>
          <h2>
            Copy module: <strong>{mod.name}</strong>
          </h2>
          <CopyModuleForm moduleId={mod.id} onSuccess={(e) => handleOnCopySuccess(e)} />
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
}
