import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  CollapseList,
  Option,
  OptionGroup,
  Select,
  TextAreaField,
  TextField,
  Tooltip,
} from '@takaro/lib-components';
import { AiOutlineClose as CloseIcon } from 'react-icons/ai';
import { ArgumentCard, ArgumentList, ContentContainer, Flex } from './style';
import { ModuleItemProperties } from 'context/moduleContext';
import { useGameServerSettings } from 'queries/gameservers';
import { useCommand, useCommandUpdate } from 'queries/modules';
import { FC, useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { StyledButton } from './style';
import { FloatingDelayGroup } from '@floating-ui/react';
import { DevTool } from '@hookform/devtools';
import { CommandArgumentCreateDTO as Argument } from '@takaro/apiclient';

interface IProps {
  moduleItem: ModuleItemProperties;
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
      type: z.string().nonempty(),
      helpText: z.string().nonempty(),
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
];

export const CommandConfig: FC<IProps> = ({ moduleItem }) => {
  const { data } = useCommand(moduleItem.itemId);
  const { data: settings } = useGameServerSettings();
  const { mutateAsync } = useCommandUpdate();

  const { control, setValue, handleSubmit } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  const {
    fields,
    append: addField,
    replace,
    remove,
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
          };
        })
      );
    }
  }, [data]);

  const commandId = moduleItem.itemId;

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    await mutateAsync({
      commandId,
      command: data,
    });
  };

  return (
    <>
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
        <CollapseList.Item title="Arguments">
          <ContentContainer>
            {fields.length > 0 && (
              <ArgumentList>
                {fields.map((field, index) => (
                  <ArgumentCard key={field.id}>
                    <Flex direction="column">
                      <Flex direction="row">
                        <FloatingDelayGroup delay={{ open: 1000, close: 200 }}>
                          <TextField
                            label="Name"
                            control={control}
                            name={`arguments.${index}.name`}
                          />
                          <Select
                            control={control}
                            name={`arguments.${index}.type`}
                            label="Type"
                            render={(selectedIndex) => (
                              <>
                                {argumentTypeSelectOptions[selectedIndex]
                                  ?.name ?? 'Select...'}
                              </>
                            )}
                          >
                            <OptionGroup label="Options">
                              {argumentTypeSelectOptions.map(
                                ({ name, value }) => (
                                  <Option
                                    key={`${field.id}-select-${name}`}
                                    value={value}
                                  >
                                    {name}
                                  </Option>
                                )
                              )}
                            </OptionGroup>
                          </Select>
                        </FloatingDelayGroup>
                      </Flex>
                      <TextField
                        control={control}
                        label="Help text"
                        name={`arguments.${index}.helpText`}
                      />
                    </Flex>
                    <Tooltip label="Remove argument">
                      <span>
                        <CloseIcon
                          size={16}
                          cursor="pointer"
                          style={{ marginTop: '14px' }}
                          onClick={() => remove(index)}
                        />
                      </span>
                    </Tooltip>
                  </ArgumentCard>
                ))}
              </ArgumentList>
            )}
            {fields.length < 5 && (
              <Button
                onClick={(_e) => {
                  addField({
                    name: '',
                    helpText: '',
                    type: '',
                    position: fields.length + 1,
                    commandId,
                  });
                }}
                type="button"
                fullWidth
                text="New"
                variant="outline"
              ></Button>
            )}
          </ContentContainer>
        </CollapseList.Item>
        <StyledButton fullWidth type="submit" text="Save" />
      </form>
      <DevTool control={control} />
    </>
  );
};
