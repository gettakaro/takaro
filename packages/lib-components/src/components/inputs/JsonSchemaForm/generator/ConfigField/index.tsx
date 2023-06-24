import {
  Control,
  UseFieldArrayRemove,
  UseFormResetField,
  useWatch,
} from 'react-hook-form';
import {
  Select,
  TextField,
  Chip,
  TextAreaField,
  IconButton,
  Tooltip,
} from '../../../../../components';
import { Header } from './style';
import { IFormInputs } from '..';
import { Input, InputType } from '../InputTypes';
import { FC, useCallback, useEffect, useState } from 'react';
import { AiOutlineDelete as RemoveIcon } from 'react-icons/ai';
import { TypeSpecificFieldsMap } from './TypeSpecificFieldsMap';

interface ConfigFieldProps {
  input: Input;
  control: Control<IFormInputs>;
  id: string;
  index: number;
  remove: UseFieldArrayRemove;
  resetField: UseFormResetField<IFormInputs>;
}

export const ConfigField: FC<ConfigFieldProps> = ({
  control,
  input,
  index,
  remove,
  id,
  resetField,
}) => {
  const [initialised, setInitialised] = useState<boolean>(false);
  const output = useWatch<IFormInputs>({
    control,
    name: `configFields.${index}.name`,
  });

  const fieldType = useWatch<IFormInputs>({
    control,
    name: `configFields.${index}.type`,
  }) as InputType;

  /* whenever the field type changes we swap all type dependent fields.
    `configFields.${index}.default` has the same name across different inputTypes.
    We need to reset the default value to the new type default value.
  */
  useEffect(() => {
    if (fieldType && initialised) {
      switch (fieldType) {
        case InputType.boolean:
          resetField(`configFields.${index}.default`, {
            defaultValue: true,
          });
          break;
        case InputType.string:
          resetField(`configFields.${index}.default`, {
            defaultValue: '',
          });
          break;
        case InputType.number:
          resetField(`configFields.${index}.default`, {
            defaultValue: 0,
          });
          break;
        case InputType.array:
          resetField(`configFields.${index}.default`, { defaultValue: [] });
          break;
      }
    } else {
      setInitialised(true);
    }
  }, [fieldType]);

  const typeSpecificFields = useCallback(TypeSpecificFieldsMap, [
    fieldType,
    index,
    id,
  ]);

  return (
    <>
      <Header>
        <div>
          <Chip color="primary" label={`Field ${index + 1}`} />
          <h3>{output as string}</h3>
        </div>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <IconButton
              onClick={() => remove(index)}
              icon={<RemoveIcon cursor="pointer" size={18} />}
            />
          </Tooltip.Trigger>
          <Tooltip.Content>Remove field</Tooltip.Content>
        </Tooltip>
      </Header>
      <TextField
        control={control}
        label="Name"
        name={`configFields.${index}.name`}
        required
      />
      <TextAreaField
        control={control}
        label="Description"
        rows={8}
        name={`configFields.${index}.description`}
        required
      />
      <Select
        control={control}
        name={`configFields.${index}.type`}
        label="Type"
        render={(selectedIndex) => (
          <div>
            {selectedIndex !== -1
              ? Object.values(InputType)[selectedIndex]
              : Object.values(InputType)[0]}
          </div>
        )}
      >
        <Select.OptionGroup label="type">
          {Object.values(InputType).map((type) => (
            <Select.Option key={`${type}-${id}`} value={type}>
              <span>{type}</span>
            </Select.Option>
          ))}
        </Select.OptionGroup>
      </Select>
      {typeSpecificFields(control, input, index, id)[fieldType]}
    </>
  );
};
