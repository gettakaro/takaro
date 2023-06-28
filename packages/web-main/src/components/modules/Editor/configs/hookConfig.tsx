import { zodResolver } from '@hookform/resolvers/zod';
import { Select, TextField } from '@takaro/lib-components';
import { ModuleItemProperties } from 'context/moduleContext';
import { useHook, useHookUpdate } from 'queries/modules';
import { FC, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { HookCreateDTOEventTypeEnum } from '@takaro/apiclient';
import { StyledButton } from './style';

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
  const { mutateAsync } = useHookUpdate();

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
      <TextField
        control={control}
        name="regex"
        label="Regex"
        readOnly={readOnly}
      />
      <Select
        control={control}
        name="eventType"
        label="Event Type"
        render={(selectedIndex) => {
          return (
            Object.values(HookCreateDTOEventTypeEnum)[selectedIndex] ??
            'Select...'
          );
        }}
        readOnly={readOnly}
      >
        <Select.OptionGroup label="eventType">
          {Object.values(HookCreateDTOEventTypeEnum).map((name) => (
            <Select.Option key={name} value={name}>
              <div>
                <span>{name}</span>
              </div>
            </Select.Option>
          ))}
        </Select.OptionGroup>
      </Select>
      {!readOnly && <StyledButton fullWidth type="submit" text="Save" />}
    </form>
  );
};
