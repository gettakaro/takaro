import { Alert, Button, Drawer, FormError, Loading, TextAreaField } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApiClient } from 'hooks/useApiClient';

export interface IFormInputs {
  data: string;
}

const validationSchema = z.object({
  data: z.string(),
});

export const ImportGameServer: FC = () => {
  const [open, setOpen] = useState(true);
  const [importError, setError] = useState<Error | null>(null);
  const [jobStatus, setJobStatus] = useState<any | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const navigate = useNavigate();
  const api = useApiClient();

  const fetchJobStatus = async () => {
    if (!jobId) return;
    const res = await api.gameserver.gameServerControllerGetImport(jobId);
    setJobStatus(res.data.data);
  };

  useEffect(() => {
    if (!open) {
      navigate(PATHS.gameServers.overview());
    }
  }, [open, navigate]);

  useEffect(() => {
    fetchJobStatus();

    const refreshInterval = setInterval(() => {
      fetchJobStatus();
    }, 5000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [jobId]);

  const { control, handleSubmit, watch } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({ data }) => {
    try {
      const res = await api.gameserver.gameServerControllerImportFromCSMM({
        csmmData: data,
      });

      setJobId(res.data.data.id);
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
      } else {
        setError(new Error('Unknown error'));
      }
    }
  };

  const { data } = watch();

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
            <TextAreaField
              control={control}
              name="data"
              label="CSMM Data"
              description="Paste your CSMM data JSON here."
            />
          </form>
          {<FormError error={importError} />}
          {jobStatus && jobStatus.status !== 'completed' && jobStatus.status !== 'failed' && <Loading />}
          {jobStatus && <pre>{JSON.stringify(jobStatus, null, 2)}</pre>}
        </Drawer.Body>
        <Drawer.Footer>
          <Button
            fullWidth
            text="Submit"
            onClick={() => {
              onSubmit({
                data,
              });
            }}
            form="create-game-server-form"
          />
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
