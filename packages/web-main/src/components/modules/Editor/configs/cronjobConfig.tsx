import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button } from '@takaro/lib-components';
import { ModuleItemProperties } from 'context/moduleContext';
import { useCronJob, useCronJobUpdate } from 'queries/modules';
import { FC, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
interface IProps {
  moduleItem: ModuleItemProperties;
  readOnly?: boolean;
}

interface IFormInputs {
  temporalValue: string;
}

const validationSchema = z.object({
  temporalValue: z.string(),
});

export const CronJobConfig: FC<IProps> = ({ moduleItem, readOnly }) => {
  const { data } = useCronJob(moduleItem.itemId);
  const { mutateAsync } = useCronJobUpdate();

  const { control, setValue, handleSubmit } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  useEffect(() => {
    if (data) {
      setValue('temporalValue', data?.temporalValue);
    }
  }, [data, setValue]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    await mutateAsync({
      cronJobId: moduleItem.itemId,
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
      {!readOnly && <Button fullWidth type="submit" text="Save cronjob config" />}
    </form>
  );
};
