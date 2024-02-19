import { zodResolver } from '@hookform/resolvers/zod';
import { SelectField, TextField, Button, Alert } from '@takaro/lib-components';
import { ModuleItemProperties } from 'hooks/useModule';
import { hookQueryOptions, useHookUpdate } from 'queries/modules';
import { FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { HookCreateDTOEventTypeEnum, HookOutputDTO, HookUpdateDTO } from '@takaro/apiclient';
import { ConfigLoading } from './ConfigLoading';
import { useQuery } from '@tanstack/react-query';

const validationSchema = z.object({
  regex: z.string(),
  eventType: z.string(),
});
type FormInputs = z.infer<typeof validationSchema>;

interface HookConfigProps {
  moduleItem: ModuleItemProperties;
  readOnly?: boolean;
}
export const HookConfig: FC<HookConfigProps> = ({ moduleItem, readOnly }) => {
  const { data: hook, isPending, isError } = useQuery(hookQueryOptions(moduleItem.itemId));
  if (isPending) return <ConfigLoading />;
  if (isError) return <Alert variant="error" text="Failed to load hook config" />;
  return <HookConfigForm hook={hook} readOnly={readOnly} />;
};

interface HookConfigFormProps {
  hook: HookOutputDTO;
  readOnly?: boolean;
}

export const HookConfigForm: FC<HookConfigFormProps> = ({ readOnly = false, hook }) => {
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
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
