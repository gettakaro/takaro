import {
  Button,
  Option,
  OptionGroup,
  Select,
  TextField,
  Tooltip,
} from '@takaro/lib-components';
import { useCommandUpdate } from 'queries/modules';
import { FC, useMemo } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { ArgumentList, ArgumentCard, ContentContainer } from './style';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AiOutlineClose as CloseIcon,
  AiOutlineMenu as DragIcon,
} from 'react-icons/ai';
import { FloatingDelayGroup } from '@floating-ui/react';

interface Props {
  commandId: string;
  defaultCommandArguments?: CommandArgument[];
}

interface CommandArgument {
  name: string;
  helpText: string;
}

export const CommandArgumentArray: FC<Props> = ({
  commandId,
  defaultCommandArguments = [],
}) => {
  const { mutateAsync } = useCommandUpdate();

  const validationSchema = useMemo(
    () =>
      z.object({
        commandArguments: z.array(
          z.object({
            name: z.string().nonempty(),
            helpText: z.string().nonempty(),
          })
        ),
      }),
    []
  );

  type FormValues = {
    commandArguments: CommandArgument[];
  };

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      commandArguments: defaultCommandArguments,
    },
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema, undefined, { raw: true }),
  });
  const { fields, append, remove } = useFieldArray({
    control: control,
    // @ts-ignore
    name: commandId,
  });

  const onSubmit: SubmitHandler<FormValues> = async ({ commandArguments }) => {
    console.log(commandArguments);
    await mutateAsync({
      commandId,
      command: {},
    });
  };

  const argumentTypeSelectOptions = [
    {
      name: 'String',
      value: 'string',
    },
    {
      name: 'Number',
      value: 'number',
    },
    {
      name: 'Boolean',
      value: 'boolean',
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ArgumentList>
        {fields.map((field, index) => (
          <ArgumentCard key={field.id}>
            <ContentContainer className="content">
              <FloatingDelayGroup delay={{ open: 1000, close: 200 }}>
                <Tooltip label="Move argument by dragging">
                  <DragIcon
                    size={18}
                    cursor="pointer"
                    onClick={() => remove(index)}
                  />
                </Tooltip>

                <TextField
                  label="Argument Name"
                  control={control}
                  name={`${commandId}.${index}.name`}
                  required
                />
                <TextField
                  label="Help Text"
                  control={control}
                  name={`${commandId}.${index}.helpText`}
                  required
                />
                <Select
                  control={control}
                  name="type"
                  label="Command type"
                  required
                  render={(selectedIndex) => (
                    <div>
                      {argumentTypeSelectOptions[selectedIndex]?.name ??
                        'Select...'}
                    </div>
                  )}
                >
                  <OptionGroup label="Options">
                    {argumentTypeSelectOptions.map(({ name, value }) => (
                      <Option key={`${field.id}-select-${name}`} value={value}>
                        <div>
                          <span>{name}</span>
                        </div>
                      </Option>
                    ))}
                  </OptionGroup>
                </Select>

                <Tooltip label="Remove argument">
                  <CloseIcon
                    size={18}
                    cursor="pointer"
                    onClick={() => remove(index)}
                  />
                </Tooltip>
              </FloatingDelayGroup>
            </ContentContainer>
          </ArgumentCard>
        ))}
      </ArgumentList>
      {fields.length < 5 && (
        <Button
          onClick={() => {
            append({ name: '', helpText: '' });
          }}
          fullWidth
          text="Add argument"
        />
      )}
      <Button type="submit" text="Save command" />
    </form>
  );
};
