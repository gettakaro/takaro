import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  CollapseList,
  FormError,
  IconButton,
  Select,
  TextAreaField,
  TextField,
  Tooltip,
} from '@takaro/lib-components';
import {
  AiOutlineClose as CloseIcon,
  AiOutlineCaretUp as UpArrowIcon,
  AiOutlineCaretDown as DownArrowIcon,
} from 'react-icons/ai';
import { ArgumentCard, ArgumentList, Column, ContentContainer, Fields, Flex } from './style';
import { ModuleItemProperties } from 'context/moduleContext';
import { useGameServerSettings } from 'queries/gameservers';
import { useCommand, useCommandUpdate } from 'queries/modules';
import { FC, useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { CommandArgumentCreateDTO as Argument } from '@takaro/apiclient';

interface IProps {
  moduleItem: ModuleItemProperties;
  readOnly?: boolean;
}

interface IFormInputs {
  trigger: string;
  helpText: string;
  arguments: Argument[];
}

const validationSchema = z.object({
  trigger: z.string().nonempty(),
  helpText: z.string(),
  arguments: z.array(
    z.object({
      commandId: z.string().nonempty(),
      name: z.string().nonempty(),
      type: z.enum(['string', 'number', 'boolean', 'player'], {
        errorMap: () => {
          return {
            message: 'Invalid argument type',
          };
        },
      }),
      helpText: z.string().nonempty(),
      defaultValue: z.string().nullable(),
      position: z.number().nonnegative(),
    })
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

export const CommandConfig: FC<IProps> = ({ moduleItem, readOnly }) => {
  const { data } = useCommand(moduleItem.itemId);
  const { data: settings } = useGameServerSettings();
  const { mutateAsync, error, isLoading } = useCommandUpdate();

  const { control, setValue, handleSubmit } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  const {
    fields,
    append: addField,
    replace,
    remove,
    swap,
  } = useFieldArray({
    control: control,
    name: 'arguments',
  });

  useEffect(() => {
    if (data) {
      setValue('trigger', data?.trigger);
      setValue('helpText', data?.helpText);

      replace(
        data.arguments.map((arg) => {
          return {
            commandId: moduleItem.itemId,
            name: arg.name,
            type: arg.type,
            position: arg.position,
            helpText: arg.helpText,
            defaultValue: arg.defaultValue,
          };
        })
      );
    }
  }, [data, moduleItem.itemId]);

  const commandId = moduleItem.itemId;

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    data.arguments = data.arguments.map((arg, index) => {
      return {
        name: arg.name,
        type: arg.type,
        helpText: arg.helpText,
        commandId: commandId,
        defaultValue: arg.defaultValue,
        position: index,
      };
    });

    await mutateAsync({
      commandId,
      command: data,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        control={control}
        name="trigger"
        label="trigger"
        description="What users type ingame to trigger this command."
        prefix={settings?.commandPrefix}
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
        <ContentContainer>
          <details>
            <summary>What are arguments?</summary>
            <p>
              Arguments are how players can control the behavior of commands. For example, if you have a command that
              spawns a vehicle, you might want to allow players to specify the color of the vehicle. You can do this by
              adding an argument with the name "color" and the type "string". Players can then use the command like{' '}
              <code>{settings?.commandPrefix}spawn red</code>
            </p>
            <p>
              The order of arguments is important! The first argument will be the first word after the command trigger,
              the second argument will be the second word, and so on.
            </p>
          </details>
          {fields.length > 0 && (
            <ArgumentList>
              {fields.map((field, index) => (
                <ArgumentCard key={field.id}>
                  <Fields>
                    <Flex>
                      <TextField label="Name" control={control} name={`arguments.${index}.name`} readOnly={readOnly} />
                      <Select
                        control={control}
                        name={`arguments.${index}.type`}
                        label="Type"
                        readOnly={readOnly}
                        render={(selectedIndex) => <>{argumentTypeSelectOptions[selectedIndex]?.name ?? 'Select...'}</>}
                      >
                        <Select.OptionGroup label="Options">
                          {argumentTypeSelectOptions.map(({ name, value }) => (
                            <Select.Option key={`${field.id}-select-${name}`} value={value}>
                              {name}
                            </Select.Option>
                          ))}
                        </Select.OptionGroup>
                      </Select>
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
                      <Tooltip>
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

                      <Tooltip>
                        <Tooltip.Trigger asChild>
                          <IconButton
                            onClick={() => remove(index)}
                            icon={<CloseIcon size={16} cursor="pointer" />}
                            ariaLabel="Remove argument"
                          />
                        </Tooltip.Trigger>
                        <Tooltip.Content>Remove argument</Tooltip.Content>
                      </Tooltip>

                      <Tooltip>
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
                  type: '',
                  defaultValue: '',
                  position: fields.length,
                  commandId,
                });
              }}
              type="button"
              fullWidth
              text="New"
              variant="outline"
            ></Button>
          )}
          {error && <FormError error={error} />}
          {!readOnly && <Button isLoading={isLoading} fullWidth type="submit" text="Save command config" />}
        </ContentContainer>
      </CollapseList.Item>
    </form>
  );
};
