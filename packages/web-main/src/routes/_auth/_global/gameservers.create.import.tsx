import { Alert, Button, CheckBox, Drawer, FileField, FormError, Spinner } from '@takaro/lib-components';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getApiClient } from '../../../util/getApiClient';
import { useSnackbar } from 'notistack';
import { gameServerKeys, useGameServerCreateFromCSMMImport } from '../../../queries/gameserver';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { hasPermission } from '../../../hooks/useHasPermission';
import { userMeQueryOptions } from '../../../queries/user';
import { useQueryClient } from '@tanstack/react-query';

export const Route = createFileRoute('/_auth/_global/gameservers/create/import')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['MANAGE_GAMESERVERS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
});

const MAX_FILE_SIZE = 50000000; // 50MB
const ACCEPTED_FILE_TYPES = ['application/json'];
const validationSchema = z.object({
  importData: z
    .any()
    .refine((files) => files?.length == 1, 'Import data is required')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, 'Max file size is 50MB.')
    .refine((files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type), 'Only .json files are accepted.'),
  roles: z.boolean(),
  players: z.boolean(),
  currency: z.boolean(),
  shop: z.boolean(),
});
function Component() {
  const [open, setOpen] = useState(true);

  const [jobStatus, setJobStatus] = useState<any | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  const { mutateAsync, error: importError } = useGameServerCreateFromCSMMImport();
  const navigate = useNavigate();
  const api = getApiClient();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const fetchJobStatus = async () => {
    if (!jobId) return;
    const res = await api.gameserver.gameServerControllerGetImport(jobId);
    setJobStatus(res.data.data);
    await queryClient.invalidateQueries({ queryKey: gameServerKeys.list() });
  };

  useEffect(() => {
    if (!open) {
      navigate({ to: '/gameservers' });
    }
  }, [open]);

  useEffect(() => {
    fetchJobStatus();

    setRefreshInterval(
      setInterval(() => {
        fetchJobStatus();
      }, 1000) as unknown as number,
    );

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [jobId]);

  useEffect(() => {
    if (!jobStatus) return;

    if (jobStatus.status === 'failed' || jobStatus.status === 'completed') {
      clearInterval(refreshInterval as unknown as number);
    }

    if (jobStatus.status === 'completed') {
      enqueueSnackbar('gameserver imported!', { variant: 'default', type: 'success' });
      navigate({ to: '/gameservers' });
    }
  }, [jobStatus]);

  const { control, handleSubmit, formState } = useForm<z.infer<typeof validationSchema>>({
    mode: 'onChange',
    resolver: zodResolver(validationSchema),
    defaultValues: {
      roles: true,
      players: true,
      currency: true,
      shop: true,
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = async ({
    importData,
    currency,
    players,
    roles,
    shop,
  }) => {
    const typedImportData = importData as FileList;
    const formData = new FormData();

    if (typedImportData.length > 0) {
      const file = typedImportData[0];
      // Read the file as text
      const fileContent = await file.text();
      formData.append('import', fileContent);
    }

    formData.append(
      'options',
      JSON.stringify({
        currency,
        players,
        roles,
        shop,
      }),
    );
    const job = await mutateAsync(formData);
    setJobId(job.id);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen} promptCloseConfirmation={formState.isDirty}>
      <Drawer.Content>
        <Drawer.Heading>Create Game Server</Drawer.Heading>
        <Drawer.Body>
          <Alert
            variant="info"
            title="Importing CSMM data"
            text={`In CSMM, go to your server settings and scroll to the experimental section. 
            Export your server there, you will get a big blob of JSON. Upload the JSON with the box below and click submit.
            
            You can select what will be imported, like players, role configs, currency, shop listings. It will also assign roles to players.
            
            For best results, ensure your server is online and connectable in CSMM before exporting.

            Takaro can NOT import your custom commands, hooks or cronjobs as they are not compatible with Takaro.`}
          />
          <form onSubmit={handleSubmit(onSubmit)} id="import-game-server-form">
            <FileField
              name="importData"
              label={'Import data'}
              description={'Upload your CSMM export JSON here'}
              required={true}
              placeholder={'export.json'}
              multiple={false}
              control={control}
            />
            <CheckBox
              control={control}
              name="roles"
              label="Import roles"
              description="Include roles in the import. If unchecked, all players will be assigned the default role."
            />
            <CheckBox
              control={control}
              name="players"
              label="Import players"
              description="Include players in the import. If unchecked, no player data will be imported."
            />
            <CheckBox
              control={control}
              name="currency"
              label="Transfer currency"
              description="Assign the currency from CSMM to the imported players."
            />
            <CheckBox
              control={control}
              name="shop"
              label="Import shop listings"
              description="Import shop listings from CSMM."
            />
          </form>
          {importError && <FormError error={importError} />}
          {jobStatus && jobStatus.status !== 'completed' && jobStatus.status !== 'failed' && <Spinner size="medium" />}
          {jobStatus && jobStatus.status === 'failed' && (
            <FormError error={jobStatus.failedReason + '. Verify that you are uploading the correct data!'} />
          )}
        </Drawer.Body>
        <Drawer.Footer>
          <Button fullWidth form="import-game-server-form" type="submit">
            Import gameserver
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}
