import { Alert, Button, Drawer, FileField, FormError, Spinner } from '@takaro/lib-components';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getApiClient } from 'util/getApiClient';
import { GameServerSearchInputDTOSortDirectionEnum } from '@takaro/apiclient';
import { useGameServerCreateFromCSMMImport } from 'queries/gameserver';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';

export interface IFormInputs {
  importData: FileList;
}

export const Route = createFileRoute('/_auth/_global/gameservers/create/import')({
  beforeLoad: async ({ context }) => {
    const session = await context.auth.getSession();
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
});
function Component() {
  const [open, setOpen] = useState(true);
  const [jobStatus, setJobStatus] = useState<any | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  const { mutateAsync, error: importError } = useGameServerCreateFromCSMMImport();
  const navigate = useNavigate();
  const api = getApiClient();

  const fetchJobStatus = async () => {
    if (!jobId) return;
    const res = await api.gameserver.gameServerControllerGetImport(jobId);
    setJobStatus(res.data.data);
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
      }, 1000) as unknown as number
    );

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [jobId]);

  useEffect(() => {
    const handleRedirect = async () => {
      const newestServerRes = await api.gameserver.gameServerControllerSearch({
        sortBy: 'createdAt',
        sortDirection: GameServerSearchInputDTOSortDirectionEnum.Desc,
        limit: 1,
      });
      localStorage.setItem('gameServerId', newestServerRes.data.data[0].id);
      navigate({
        to: '/gameserver/$gameServerId/dashboard/overview',
        params: { gameServerId: newestServerRes.data.data[0].id },
      });
    };

    if (!jobStatus) return;

    if (jobStatus.status === 'failed' || jobStatus.status === 'completed') {
      clearInterval(refreshInterval as unknown as number);
    }

    if (jobStatus.status === 'completed') {
      handleRedirect();
    }
  }, [jobStatus]);

  const { control, handleSubmit } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({ importData }) => {
    const formData = new FormData();
    formData.append('import.json', importData[0]);
    const job = await mutateAsync(formData);
    setJobId(job.id);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Heading>Create Game Server</Drawer.Heading>
        <Drawer.Body>
          <Alert
            variant="info"
            title="Importing CSMM data"
            text={`In CSMM, go to your server settings and scroll to the experimental section. 
            Export your server there, you will get a big blob of JSON. Paste that JSON into the box below and click submit.
            
            Takaro will import your server, players and role configs. It will assign roles to players.
            
            It will NOT import your custom commands, hooks or cronjobs as they are not compatible with Takaro.`}
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
          </form>
          {importError && <FormError error={importError} />}
          {jobStatus && jobStatus.status !== 'completed' && jobStatus.status !== 'failed' && <Spinner size="medium" />}
          {jobStatus && <pre>{JSON.stringify(jobStatus, null, 2)}</pre>}
        </Drawer.Body>
        <Drawer.Footer>
          <Button fullWidth text="Submit" form="import-game-server-form" type="submit" />
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}
