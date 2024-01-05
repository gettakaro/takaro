import { zodResolver } from '@hookform/resolvers/zod';
import { SelectField, TextField, Button } from '@takaro/lib-components';
import { ModuleItemProperties } from 'context/moduleContext';
import { useHook, useHookUpdate } from 'queries/modules';
import { FC, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { HookCreateDTOEventTypeEnum } from '@takaro/apiclient';

interface IProps {
  moduleItem: ModuleItemProperties;
  readOnly?: boolean;
}

interface IFormInputs {
  regex: string;
  eventType: HookCreateDTOEventTypeEnum;
}

const validationSchema = z.object({
  regex: z.string(),
  eventType: z.string(),
});

export const HookConfig: FC<IProps> = ({ moduleItem, readOnly }) => {
  const { data } = useHook(moduleItem.itemId);
  const { mutateAsync, isLoading } = useHookUpdate();

  const { control, setValue, handleSubmit } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  useEffect(() => {
    if (data) {
      setValue('regex', data?.regex);
      setValue('eventType', data?.eventType);
    }
  }, [data, setValue]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    await mutateAsync({
      hookId: moduleItem.itemId,
      hook: data,
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
      {!readOnly && <Button isLoading={isLoading} fullWidth type="submit" text="Save hook config" />}
    </form>
  );
};
