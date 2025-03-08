import { zodResolver } from '@hookform/resolvers/zod';
import { SelectField, TextField, Button, Alert, TextAreaField } from '@takaro/lib-components';
import { HookCreateDTOEventTypeEnum, HookOutputDTO, HookUpdateDTO } from '@takaro/apiclient';
import { hookQueryOptions, useHookUpdate } from '../../../../../queries/module';
import { FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { ConfigLoading } from './ConfigLoading';
import { useQuery } from '@tanstack/react-query';

const validationSchema = z.object({
  regex: z.string(),
  eventType: z.string(),
  description: z.string().optional(),
});
type FormInputs = z.infer<typeof validationSchema>;

interface HookConfigProps {
  itemId: string;
  readOnly?: boolean;
  moduleId: string;
}
export const HookConfig: FC<HookConfigProps> = ({ itemId, readOnly, moduleId }) => {
  const { data: hook, isPending, isError } = useQuery(hookQueryOptions(itemId));
  if (isPending) return <ConfigLoading />;
  if (isError) return <Alert variant="error" text="Failed to load hook config" />;
  return <HookConfigForm hook={hook} readOnly={readOnly} moduleId={moduleId} />;
};

interface HookConfigFormProps {
  hook: HookOutputDTO;
  readOnly?: boolean;
  moduleId: string;
}

export const HookConfigForm: FC<HookConfigFormProps> = ({ readOnly = false, hook, moduleId }) => {
  const { mutateAsync, isPending } = useHookUpdate();

  const { control, handleSubmit, formState } = useForm<FormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
    values: {
      regex: hook.regex,
      eventType: hook.eventType,
    },
  });

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    await mutateAsync({
      hookId: hook.id,
      hook: data as HookUpdateDTO,
      moduleId,
      versionId: hook.versionId,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextAreaField
        control={control}
        name="description"
        label="Description"
        description="A description of what this hook does"
        readOnly={readOnly}
      />
      <TextField control={control} name="regex" label="Regex" readOnly={readOnly} />
      <SelectField
        control={control}
        name="eventType"
        label="Event Type"
        render={(selectedItems) => {
          if (selectedItems.length === 0) {
            return <div>'Select...'</div>;
          }
          return selectedItems[0].label;
        }}
        readOnly={readOnly}
      >
        <SelectField.OptionGroup label="eventType">
          {Object.values(HookCreateDTOEventTypeEnum).map((name) => (
            <SelectField.Option key={name} value={name} label={name}>
              <div>
                <span>{name}</span>
              </div>
            </SelectField.Option>
          ))}
        </SelectField.OptionGroup>
      </SelectField>
      {!readOnly && (
        <Button disabled={!formState.isDirty} isLoading={isPending} fullWidth type="submit" text="Save hook config" />
      )}
    </form>
  );
};
