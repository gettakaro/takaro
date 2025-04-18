import { zodResolver } from '@hookform/resolvers/zod';
import { FunctionOutputDTO } from '@takaro/apiclient';
import { Button, Alert, TextAreaField } from '@takaro/lib-components';
import { functionQueryOptions, useFunctionUpdate } from '../../../../../queries/module';
import { FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { ConfigLoading } from './ConfigLoading';
import { useQuery } from '@tanstack/react-query';

const validationSchema = z.object({
  description: z.string().optional(),
});
type FormInputs = z.infer<typeof validationSchema>;

interface FunctionConfigProps {
  itemId: string;
  readOnly?: boolean;
  moduleId: string;
  versionId: string;
}

export const FunctionConfig: FC<FunctionConfigProps> = ({ itemId, readOnly = false, moduleId, versionId }) => {
  const { data, isPending, isError } = useQuery(functionQueryOptions(itemId));
  if (isPending) return <ConfigLoading />;
  if (isError) return <Alert variant="error" text="Failed to load function config" />;
  return <FunctionConfigForm fn={data} readOnly={readOnly} moduleId={moduleId} versionId={versionId} />;
};

interface FunctionConfigFormProps {
  readOnly?: boolean;
  fn: FunctionOutputDTO;
  moduleId: string;
  versionId: string;
}

export const FunctionConfigForm: FC<FunctionConfigFormProps> = ({ fn, readOnly = false, moduleId, versionId }) => {
  const { mutateAsync, isPending } = useFunctionUpdate();

  const { control, handleSubmit, formState } = useForm<FormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
    values: {
      description: fn.description,
    },
  });

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    await mutateAsync({
      functionId: fn.id,
      fn: data,
      moduleId,
      versionId,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextAreaField
        control={control}
        name="description"
        label="Description"
        description="A description of what this function does"
        readOnly={readOnly}
      />
      {!readOnly && (
        <Button
          isLoading={isPending}
          disabled={!formState.isDirty}
          fullWidth
          type="submit"
          text="Save function config"
        />
      )}
    </form>
  );
};
