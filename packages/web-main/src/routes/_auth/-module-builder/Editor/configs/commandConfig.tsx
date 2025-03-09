import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  CollapseList,
  FormError,
  IconButton,
  SelectField,
  TextAreaField,
  TextField,
  Tooltip,
  Collapsible,
  Alert,
} from '@takaro/lib-components';

import {
  AiOutlineClose as CloseIcon,
  AiOutlineCaretUp as UpArrowIcon,
  AiOutlineCaretDown as DownArrowIcon,
} from 'react-icons/ai';

import { ArgumentCard, ArgumentList, Column, ContentContainer, Fields, Flex } from './style';
import { globalGameServerSetingQueryOptions } from '../../../../../queries/setting';
import { commandQueryOptions, useCommandUpdate } from '../../../../../queries/module';
import { FC } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { CommandOutputDTO, CommandUpdateDTO } from '@takaro/apiclient';
import { ConfigLoading } from './ConfigLoading';
import { useQuery } from '@tanstack/react-query';

const validationSchema = z.object({
  trigger: z.string().min(1, { message: 'Trigger is required' }),
  description: z.string().optional(),
  helpText: z.string(),
  arguments: z.array(
    z.object({
      commandId: z.string().min(1, { message: 'Command ID is required' }),
      name: z.string().min(1, { message: 'Name is required' }),
      type: z.enum(['string', 'number', 'boolean', 'player'], {
        errorMap: () => {
          return {
            message: 'Invalid argument type',
          };
        },
      }),
      helpText: z.string().min(1, { message: 'Help text is required' }),
      defaultValue: z.string().nullable(),
      position: z.number().nonnegative(),
    }),
  ),
});

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
  {
    name: 'Player',
    value: 'player',
  },
];

interface CommandConfigProps {
  itemId: string;
  readOnly?: boolean;
  moduleId: string;
}

export const CommandConfig: FC<CommandConfigProps> = ({ itemId, readOnly, moduleId }) => {
  const { data: command, isPending: isLoadingCommand, isError } = useQuery(commandQueryOptions(itemId));
  const { data: settings, isPending: isLoadingSetting } = useQuery(globalGameServerSetingQueryOptions('commandPrefix'));

  if (isLoadingCommand || isLoadingSetting) {
    return <ConfigLoading />;
  }

  if (isError) {
    return <Alert variant="error" text="Failed to load command config" />;
  }

  // fallback to `/`
  const prefix = (settings && settings?.value) ?? '/';

  return <CommandConfigForm commandPrefix={prefix} command={command} readOnly={readOnly} moduleId={moduleId} />;
};

interface CommandConfigFormProps {
  command: CommandOutputDTO;
  readOnly?: boolean;
  commandPrefix?: string;
  moduleId: string;
}

export const CommandConfigForm: FC<CommandConfigFormProps> = ({ command, readOnly, commandPrefix, moduleId }) => {
  const { mutateAsync, error, isPending } = useCommandUpdate();

  const { control, handleSubmit, formState, reset } = useForm<z.infer<typeof validationSchema>>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
    values: {
      trigger: command.trigger,
      helpText: command.helpText,
      description: command.description,
      arguments: command.arguments
        .sort((a, b) => a.position - b.position)
        .map((arg) => {
          return {
            commandId: command.id,
            name: arg.name,
            type: arg.type as 'string' | 'number' | 'boolean' | 'player',
            position: arg.position,
            helpText: arg.helpText,
            defaultValue: arg.defaultValue ?? null,
          };
        }),
    },
  });

  const {
    fields,
    append: addField,
    remove,
    swap,
  } = useFieldArray({
    control: control,
    name: 'arguments',
  });

  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = async (data) => {
    data.arguments = data.arguments.map((arg, index) => {
      return {
        name: arg.name,
        type: arg.type,
        helpText: arg.helpText,
        commandId: command.id,
        defaultValue: arg.defaultValue,
        position: index,
      };
    });

    await mutateAsync({
      commandId: command.id,
      command: data as CommandUpdateDTO,
      versionId: command.versionId,
      moduleId: moduleId,
    });
    reset({}, { keepValues: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextAreaField
        control={control}
        name="description"
        label="Description"
        description="A description of what this command does"
        readOnly={readOnly}
      />
      <TextField
        control={control}
        name="trigger"
        label="trigger"
        description="What users type ingame to trigger this command."
        prefix={commandPrefix}
        readOnly={readOnly}
      />
      <TextAreaField
        control={control}
        name="helpText"
        label="Help text"
        description="Description of what the command does, this can be displayed to users in-game."
        readOnly={readOnly}
      />
      <CollapseList.Item title="Arguments">
        <Collapsible>
          <Collapsible.Trigger>What are arguments?</Collapsible.Trigger>
          <Collapsible.Content>
            Arguments are how players can control the behavior of commands. For example, if you have a command that
            spawns a vehicle, you might want to allow players to specify the color of the vehicle. You can do this by
            adding an argument with the name "color" and the type "string". Players can then use the command like{' '}
            <code>{commandPrefix}spawn red</code>
          </Collapsible.Content>
          <Collapsible.Content>
            The order of arguments is important! The first argument will be the first word after the command trigger,
            the second argument will be the second word, and so on.
          </Collapsible.Content>
        </Collapsible>
        <ContentContainer>
          {fields.length > 0 && (
            <ArgumentList>
              {fields.map((field, index) => (
                <ArgumentCard key={field.id}>
                  <Fields>
                    <Flex>
                      <TextField label="Name" control={control} name={`arguments.${index}.name`} readOnly={readOnly} />
                      <SelectField
                        control={control}
                        name={`arguments.${index}.type`}
                        label="Type"
                        readOnly={readOnly}
                        render={(selectedItems) => {
                          if (selectedItems.length === 0) {
                            return <div>Select...</div>;
                          }
                          return <div>{selectedItems[0].label}</div>;
                        }}
                      >
                        <SelectField.OptionGroup label="Options">
                          {argumentTypeSelectOptions.map(({ name, value }) => (
                            <SelectField.Option key={`${field.id}-select-${name}`} value={value} label={name}>
                              {name}
                            </SelectField.Option>
                          ))}
                        </SelectField.OptionGroup>
                      </SelectField>
                    </Flex>
                    <TextField
                      control={control}
                      label="Help text"
                      readOnly={readOnly}
                      name={`arguments.${index}.helpText`}
                    />
                    <TextField
                      control={control}
                      label="Default value"
                      readOnly={readOnly}
                      name={`arguments.${index}.defaultValue`}
                    />
                  </Fields>
                  {!readOnly && (
                    <Column>
                      <Tooltip placement="right">
                        <Tooltip.Trigger asChild>
                          <IconButton
                            disabled={index === 0}
                            onClick={() => {
                              swap(index, index - 1);
                            }}
                            icon={<UpArrowIcon size={16} cursor="pointer" />}
                            ariaLabel="Move up"
                          />
                        </Tooltip.Trigger>
                        <Tooltip.Content>Move up</Tooltip.Content>
                      </Tooltip>

                      <Tooltip placement="right">
                        <Tooltip.Trigger asChild>
                          <IconButton
                            onClick={() => remove(index)}
                            icon={<CloseIcon size={16} cursor="pointer" />}
                            ariaLabel="Remove argument"
                          />
                        </Tooltip.Trigger>
                        <Tooltip.Content>Remove argument</Tooltip.Content>
                      </Tooltip>

                      <Tooltip placement="right">
                        <Tooltip.Trigger asChild>
                          <IconButton
                            disabled={index === fields.length - 1}
                            onClick={() => swap(index, index + 1)}
                            icon={<DownArrowIcon size={16} cursor="pointer" />}
                            ariaLabel="Move down"
                          />
                        </Tooltip.Trigger>
                        <Tooltip.Content>Move down</Tooltip.Content>
                      </Tooltip>
                    </Column>
                  )}
                </ArgumentCard>
              ))}
            </ArgumentList>
          )}
          {!readOnly && fields.length < 5 && (
            <Button
              onClick={(_e) => {
                addField({
                  name: '',
                  helpText: '',
                  type: 'string',
                  defaultValue: '',
                  position: fields.length,
                  commandId: command.id,
                });
              }}
              type="button"
              fullWidth
              text="New"
              variant="outline"
            ></Button>
          )}
          {error && <FormError error={error} />}
        </ContentContainer>
      </CollapseList.Item>
      {!readOnly && (
        <Button
          isLoading={isPending}
          disabled={!formState.isDirty}
          fullWidth
          type="submit"
          text="Save command config"
        />
      )}
    </form>
  );
};
