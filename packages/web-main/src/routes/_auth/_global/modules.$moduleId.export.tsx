import { Chip, Dialog } from '@takaro/lib-components';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';
import { moduleExportOptions, moduleQueryOptions } from 'queries/modules';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AiFillCopy as CopyIcon, AiOutlineCheck as CheckmarkIcon } from 'react-icons/ai';

export const Route = createFileRoute('/_auth/_global/modules/$moduleId/export')({
  beforeLoad: ({ context }) => {
    if (!hasPermission(context.auth.session, ['READ_MODULES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ params, context }) => context.queryClient.ensureQueryData(moduleQueryOptions(params.moduleId)),
  component: Component,
});

function Component() {
  const [openDialog, setOpenDialog] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const mod = Route.useLoaderData();
  const { data: exported, isFetched } = useQuery(moduleExportOptions(mod.id));
  const { enqueueSnackbar } = useSnackbar();

  function handleCopy() {
    if (exported) {
      navigator.clipboard.writeText(JSON.stringify(exported));
      setCopied(true);
      enqueueSnackbar('Module successfully copied to clipboard. ', { variant: 'default', type: 'success' });
    }
  }

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <Dialog.Content>
        <Dialog.Heading size={4}>
          Module: <span style={{ textTransform: 'capitalize' }}>{mod.name}</span>
        </Dialog.Heading>
        <Dialog.Body>
          <Chip
            icon={copied ? <CheckmarkIcon /> : <CopyIcon />}
            onClick={() => handleCopy()}
            variant="outline"
            label={copied ? 'copied' : isFetched ? 'Export' : 'Loading...'}
            color="backgroundAccent"
          />
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
}
