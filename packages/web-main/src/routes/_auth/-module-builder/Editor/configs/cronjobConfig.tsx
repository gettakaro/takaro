import { zodResolver } from '@hookform/resolvers/zod';
import { CronJobOutputDTO } from '@takaro/apiclient';
import { TextField, Button, Alert } from '@takaro/lib-components';
import { cronjobQueryOptions, useCronJobUpdate } from '../../../../../queries/module';
import { FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { ConfigLoading } from './ConfigLoading';
import { useQuery } from '@tanstack/react-query';

const validationSchema = z.object({
  temporalValue: z.string(),
});
type FormInputs = z.infer<typeof validationSchema>;

interface CronJobConfigProps {
  itemId: string;
  readOnly?: boolean;
  moduleId: string;
}

export const CronJobConfig: FC<CronJobConfigProps> = ({ itemId, readOnly = false, moduleId }) => {
  const { data, isPending, isError } = useQuery(cronjobQueryOptions(itemId));
  if (isPending) return <ConfigLoading />;
  if (isError) return <Alert variant="error" text="Failed to load command config" />;
  return <CronJobConfigForm cronjob={data} readOnly={readOnly} moduleId={moduleId} />;
};

interface CronJobConfigFormProps {
  readOnly?: boolean;
  cronjob: CronJobOutputDTO;
  moduleId: string;
}

export const CronJobConfigForm: FC<CronJobConfigFormProps> = ({ cronjob, readOnly = false, moduleId }) => {
  const { mutateAsync, isPending } = useCronJobUpdate();

  const { control, handleSubmit, formState } = useForm<FormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
    values: {
      temporalValue: cronjob.temporalValue,
    },
  });

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    await mutateAsync({
      cronJobId: cronjob.id,
      cronJob: data,
      moduleId,
      versionId: cronjob.versionId,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        control={control}
        name="temporalValue"
        label="temporalValue"
        description="This controls when the cronjob triggers, you can use https://crontab.guru/ to help you with the syntax. Note that this is a default value, you can override this per-gameserver when you install this module"
        readOnly={readOnly}
      />
      {!readOnly && (
        <Button
          isLoading={isPending}
          disabled={!formState.isDirty}
          fullWidth
          type="submit"
          text="Save cronjob config"
        />
      )}
    </form>
  );
};
