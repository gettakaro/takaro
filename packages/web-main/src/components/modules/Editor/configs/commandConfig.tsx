import { zodResolver } from '@hookform/resolvers/zod';
import { Button, TextAreaField, TextField } from '@takaro/lib-components';
import { ModuleItemProperties } from 'context/moduleContext';
import { useGameServerSettings } from 'queries/gameservers';
import { useCommand, useCommandUpdate } from 'queries/modules';
import { FC, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

interface IProps {
  moduleItem: ModuleItemProperties;
}

interface IFormInputs {
  trigger: string;
  helpText: string;
}

const validationSchema = z.object({
  trigger: z.string(),
  helpText: z.string(),
});

export const CommandConfig: FC<IProps> = ({ moduleItem }) => {
  const { data } = useCommand(moduleItem.itemId);
  const { data: settings } = useGameServerSettings();
  const { mutateAsync } = useCommandUpdate();

  const { control, setValue, handleSubmit } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  useEffect(() => {
    if (data) {
      setValue('trigger', data?.trigger);
      setValue('helpText', data?.helpText);
    }
  }, [data]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    await mutateAsync({
      commandId: moduleItem.itemId,
      command: data,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        control={control}
        name="trigger"
        label="trigger"
        description="What users type ingame to trigger this command"
        prefix={settings?.commandPrefix}
      />
      <TextAreaField
        control={control}
        name="helpText"
        label="Help text"
        description="Description of what the command does, this can be displayed to users ingame"
      />
      <Button fullWidth type="submit" text="Save" />
    </form>
  );
};
