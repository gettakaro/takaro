import { zodResolver } from '@hookform/resolvers/zod';
import { CronJobOutputDTO } from '@takaro/apiclient';
import { TextField, Button, Alert } from '@takaro/lib-components';
import { cronjobQueryOptions, useCronJobUpdate } from 'queries/module';
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
}

export const CronJobConfig: FC<CronJobConfigProps> = ({ itemId, readOnly = false }) => {
  const { data, isPending, isError } = useQuery(cronjobQueryOptions(itemId));
  if (isPending) return <ConfigLoading />;
  if (isError) return <Alert variant="error" text="Failed to load command config" />;
  return <CronJobConfigForm cronjob={data} readOnly={readOnly} />;
};

interface CronJobConfigFormProps {
  readOnly?: boolean;
  cronjob: CronJobOutputDTO;
}

export const CronJobConfigForm: FC<CronJobConfigFormProps> = ({ cronjob, readOnly = false }) => {
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
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        control={control}
        name="temporalValue"
        label="temporalValue"
        description="This controls when the cronjob triggers, you can use https://crontab.guru/ to help you with the syntax."
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
